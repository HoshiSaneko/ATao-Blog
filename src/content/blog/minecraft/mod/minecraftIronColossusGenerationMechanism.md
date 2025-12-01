---
title: minecraft铁傀儡生成机制
date: '2025年02月27日'
tags: ['minecraft']
summary: 本文简要介绍了minecraft铁傀儡的生成机制，包括生成条件、恐慌状态下的生成、交谈状态下的生成、生成过程以及冷却时间等核心机制。
---

:::alert{type:info, title:提示}
只讨论java版通过村民来生成铁傀儡
:::

### 生成条件

在`Java`版里，不管村民是**惊慌**还是**交谈**，都能生成铁傀儡。

村民尝试生成铁傀儡时，系统最多试十次，在以村民为中心，水平 **±8** 格、垂直 **±6** 格（17×13×17 格范围）内生成。

每次尝试，系统会在该范围随机选个 1×1、高 13 格的柱状区域，从顶向下找合适位置生成铁傀儡，找不到就失败。若多个位置 X、Z 坐标一样，铁傀儡只在最高处生成，低处即便合适也不行 。

![图片](https://cdn.atao.cyou/Blog/blog_250227_220604.png)

铁傀儡的合适位置需符合以下条件：

- 该处需为空气或液体
- 该处下方的方块必须是固体方块或细雪
- 该处下方不能是下列方块：
    - 冰
    - 浮冰
    - 玻璃（含染色与遮光变种）
    - 玻璃板（含染色变种）
    - 树叶
    - 仙人掌
    - TNT
    - 蜘蛛网
    - 信标
    - 荧石
    - 海晶灯
    - 潮涌核心

选定合适位置后，若该位置下方为可生成方块，且生成的铁傀儡不会和任何其他实体和方块的碰撞箱碰撞，则铁傀儡会被生成在此处；否则，此次尝试失败。

### 恐慌

村民在遇到**敌对生物**时，会进入`惊慌`状态。村民对敌对生物的**感知距离**如下:

```java
private static final ImmutableMap<EntityType<?>, Float> SQUARED_DISTANCES_FOR_DANGER = ImmutableMap.<EntityType<?>, Float>builder()
    .put(EntityType.DROWNED, 8.0F)  // 溺尸：8格
    .put(EntityType.EVOKER, 12.0F)  // 唤魔者：12格
    .put(EntityType.HUSK, 8.0F)  // 尸壳：8格
    .put(EntityType.ILLUSIONER, 12.0F)  // 幻术师：12格
    .put(EntityType.PILLAGER, 15.0F)  // 掠夺者：15格
    .put(EntityType.RAVAGER, 12.0F)  // 劫掠兽：12格
    .put(EntityType.VEX, 8.0F)  // 恼鬼：8格
    .put(EntityType.VINDICATOR, 10.0F)  // 卫道士：10格
    .put(EntityType.ZOGLIN, 10.0F)  // 僵尸疣猪兽：10格
    .put(EntityType.ZOMBIE, 8.0F)  // 僵尸：8格
    .put(EntityType.ZOMBIE_VILLAGER, 8.0F)  // 僵尸村民：8格
    .build();
```

在惊慌状态的村民会每100游戏刻（5秒）尝试生成一次铁傀儡，若周围有2个有意愿生成铁傀儡的村民（一共3个村民），就会判定成功进行生成。

```java
protected void keepRunning(ServerWorld serverWorld, VillagerEntity villagerEntity, long l) {
    if (l % 100L == 0L) {
        villagerEntity.summonGolem(serverWorld, l, 3);
    }
}
```

### 交谈

如果村民不处于`惊慌`状态，村民会每1200游戏刻（60秒）传播一次言论，若周围有4个村民同样有生成铁傀儡的意愿（一共5个村民），就会判定成功进行生成步骤。

```java
public void talkWithVillager(ServerWorld world, VillagerEntity villager, long time) {
    if ((time < this.gossipStartTime || time >= this.gossipStartTime + 1200L) && (time < villager.gossipStartTime || time >= villager.gossipStartTime + 1200L)) {
        // 分享来自另一个村民的言论
        this.gossip.shareGossipFrom(villager.gossip, this.random, 10);
        this.gossipStartTime = time;
        villager.gossipStartTime = time;
        // 尝试在给定的世界中生成一个铁傀儡
        this.summonGolem(world, time, 5);
    }
}
```

### 生成

```java
public boolean canSummonGolem(long time) {
    // 如果最近没有睡觉且记忆中没有记录最近检测到铁傀儡，则可以召唤
    return !this.hasRecentlySlept(this.getWorld().getTime()) ? false : !this.brain.hasMemoryModule(MemoryModuleType.GOLEM_DETECTED_RECENTLY);
}
```

```java
public void summonGolem(ServerWorld world, long time, int requiredCount) {
    if (this.canSummonGolem(time)) {
        Box box = this.getBoundingBox().expand(10.0, 10.0, 10.0);
        // 在指定区域内查找所有村民实体
        List<VillagerEntity> list = world.getNonSpectatingEntities(VillagerEntity.class, box);
        List<VillagerEntity> list2 = list.stream().filter(villager -> villager.canSummonGolem(time)).limit(5L).toList();
        // 尝试召唤铁傀儡
        if (list2.size() >= requiredCount) {
            if (!LargeEntitySpawnHelper.trySpawnAt(
                    EntityType.IRON_GOLEM, SpawnReason.MOB_SUMMONED, world, this.getBlockPos(), 10, 8, 6, LargeEntitySpawnHelper.Requirements.IRON_GOLEM, false
                )
                .isEmpty()) {
                // 遍历所有村民并记录他们看到铁傀儡的时间
                list.forEach(GolemLastSeenSensor::rememberIronGolem);
            }
        }
    }
}
```

### 冷却

当铁傀儡生成之后，以该村民为中心周围10格内的所有村民会进入600游戏刻（30秒）的冷却时间。

```java
// 让实体记住它最近看到了铁傀儡的方法
public static void rememberIronGolem(LivingEntity entity) {
    // 设置“Golem Detected Recently”的记忆为true，并设置过期时间为599毫秒
    entity.getBrain().remember(MemoryModuleType.GOLEM_DETECTED_RECENTLY, true, 599L);
}
```

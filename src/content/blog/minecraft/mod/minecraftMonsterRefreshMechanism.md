---
title: minecraft刷怪机制
date: '2025年02月25日'
tags: ['minecraft']
summary: 本文简要介绍了Minecraft的刷怪机制，包括生物类别划分、生成上限计算、核心生成条件、生成步骤流程以及LC值对刷怪效率的影响。
---
### 生物类别

minecraft中生物被划分为8种类别，分别为`怪物（Monster）`、`动物（Creature）`、`环境生物（Ambient）`、`美西螈（Axolotls）`、`地下水生生物（Underground Water Creature）`、`水生生物（Water Creature）`、`水下环境生物（Water Ambient）`和`其他（Misc）`。

| 类别         | 上限乘数 | 友好生物 | 自动清除 | 清除半径 |
| ------------ | -------- | -------- | -------- | -------- |
| 怪物         | 70       | 否       | 是       | 128      |
| 动物         | 10       | 是       | 否       | 128      |
| 环境生物     | 15       | 是       | 是       | 128      |
| 美西螈       | 5        | 是       | 是       | 128      |
| 地下水生生物 | 5        | 是       | 是       | 128      |
| 水生生物     | 5        | 是       | 是       | 128      |
| 水下环境生物 | 20       | 是       | 是       | 64       |
| 其他         | -1       | 是       | 否       | 128      |

```java
public enum SpawnGroup implements StringIdentifiable {
	MONSTER("monster", 70, false, false, 128),
	CREATURE("creature", 10, true, true, 128),
	AMBIENT("ambient", 15, true, false, 128),
	AXOLOTLS("axolotls", 5, true, false, 128),
	UNDERGROUND_WATER_CREATURE("underground_water_creature", 5, true, false, 128),
	WATER_CREATURE("water_creature", 5, true, false, 128),
	WATER_AMBIENT("water_ambient", 20, true, false, 64),
	MISC("misc", -1, true, true, 128);
    //...
}
```

### 生成上限

为了阻止生物无限生成，每个生物类别都有它们的生成上限数量。生成上限数量不仅与类别本身有关，也与玩家有关。

以每个玩家所在区块为中心的17×17区块都被认为是`可生成区块`{lang="yaml"}，而每个生物类别的生成上限*m*是可生成区块数量*c*、生物类别上限乘数*a*之积除以289得到的，即m=ac/289。

- 当仅有一位玩家时生成上限m就等于上线乘数a，即m=a
- 当存在n名玩家时假如所有玩家所在的可生成区块互不干扰，则生成上限为最大值na，假如所有玩家在同一个区块，则生成上限与一名玩家相同为a。因此该情况下，生成上限m在[a, na]范围之间。

### 生成条件

:::alert{type:info, title:提示}
主要介绍普通敌对生物的生成条件，史莱姆等特殊生物除外
:::

- **光照条件**：天空光<=7，方块光=0。

- **空间要求**：下方必须是非透明方块。僵尸/骷髅需要至少2格高，蜘蛛需要至少3格宽的空间。

- **玩家距离**：距离玩家半径24~128的球形区域。

- **生成上限**：超过生成上限时，将生成失败。

- **碰撞箱检测**： 生成时需满足碰撞箱无遮挡。

### 核心步骤

#### 1. 生物群系筛选

根据生物群系配置获取可生成的生物列表，并基于群系生成概率决定是否进入生成循环。

```java
SpawnSettings spawnSettings = biomeEntry.value().getSpawnSettings();
Pool<SpawnSettings.SpawnEntry> pool = spawnSettings.getSpawnEntries(SpawnGroup.CREATURE);
if (!pool.isEmpty()) {
    int i = chunkPos.getStartX();
    int j = chunkPos.getStartZ();

    while (random.nextFloat() < spawnSettings.getCreatureSpawnProbability()) {
    // ...
    }
    // ...
}
```

#### 2. 初始点

X/Z轴在区块内随机选择初始点，Y轴从非透明方块的最高点+1到世界底部的随机值

```java
private static BlockPos getRandomPosInChunkSection(World world, WorldChunk chunk) {
    ChunkPos chunkPos = chunk.getPos();
    int i = chunkPos.getStartX() + world.random.nextInt(16);
    int j = chunkPos.getStartZ() + world.random.nextInt(16);
    int k = chunk.sampleHeightmap(Heightmap.Type.WORLD_SURFACE, i, j) + 1;
    int l = MathHelper.nextBetween(world.random, world.getBottomY(), k);
    return new BlockPos(i, l, j);
}
```

#### 3. 生成尝试

每个初始点触发3次生成游走尝试

```java
 // 外层循环：3次生成游走尝试
for (int k = 0; k < 3; k++) {
    int l = pos.getX(); // 初始X坐标
    int m = pos.getZ(); // 初始Z坐标
    SpawnSettings.SpawnEntry spawnEntry = null; // 当前生成的生物配置
    EntityData entityData = null; // 生物初始化数据
    // 计算本次游走的生成尝试次数（1-4次）
    int o = MathHelper.ceil(world.random.nextFloat() * 4.0F);
    int p = 0; // 本次游走已生成的生物数

    // 内层循环：单次游走中的生成尝试
    for (int q = 0; q < o; q++) {
        // 随机偏移坐标（X/Z各±0-5格）
        l += world.random.nextInt(6) - world.random.nextInt(6);
        m += world.random.nextInt(6) - world.random.nextInt(6);
        mutable.set(l, i, m); // 设置候选坐标

        // 计算精确坐标（用于距离检查）
        double d = (double)l + 0.5;
        double e = (double)m + 0.5;
        // 查找最近玩家（用于距离判定）
        PlayerEntity playerEntity = world.getClosestPlayer(d, (double)i, e, -1.0, false);

        if (playerEntity != null) {
            // 计算与玩家的平方距离（优化计算）
            double f = playerEntity.squaredDistanceTo(d, (double)i, e);

            // 检查候选位置是否合法
            if (isAcceptableSpawnPosition(world, chunk, mutable, f)) {
                // 首次生成时选择生物类型
                if (spawnEntry == null) {
                    // 根据群系/结构选择可生成的生物条目
                    Optional<SpawnSettings.SpawnEntry> optional = pickRandomSpawnEntry(
                        world, structureAccessor, chunkGenerator, group, world.random, mutable
                    );
                    if (optional.isEmpty()) break; // 无可用生物则终止本次游走

                    spawnEntry = optional.get();
                    // 动态调整生成次数（基于生物群大小）
                    o = spawnEntry.minGroupSize + world.random.nextInt(
                        1 + spawnEntry.maxGroupSize - spawnEntry.minGroupSize
                    );
                }

                // 最终生成条件验证
                if (canSpawn(world, group, structureAccessor, chunkGenerator, spawnEntry, mutable, f)
                    && checker.test(spawnEntry.type, mutable, chunk)) { // 自定义条件检查

                    // 创建生物实体
                    MobEntity mobEntity = createMob(world, spawnEntry.type);
                    if (mobEntity == null) return; // 创建失败终止方法

                    // 设置生物位置和角度
                    mobEntity.refreshPositionAndAngles(d, (double)i, e,
                        world.random.nextFloat() * 360.0F, 0.0F);

                    // 验证生物生成合法性
                    if (isValidSpawn(world, mobEntity, f)) {
                        // 初始化生物（生成装备/设置属性）
                        entityData = mobEntity.initialize(world,
                            world.getLocalDifficulty(mobEntity.getBlockPos()),
                            SpawnReason.NATURAL,
                            entityData
                        );

                        // 更新计数器
                        j++;
                        p++;

                        // 将生物加入世界
                        world.spawnEntityAndPassengers(mobEntity);
                        runner.run(mobEntity, chunk); // 执行生成后回调

                        // 检查区块生物上限
                        if (j >= mobEntity.getLimitPerChunk()) {
                            return; // 达到上限立即终止
                        }

                        // 检查单次尝试生成数限制（如末影人最多生成1只）
                        if (mobEntity.spawnsTooManyForEachTry(p)) {
                            break;
                        }
                    }
                }
            }
        }
    } // 结束内层循环
} // 结束外层循环
```

#### 生成验证

满足以下条件，将导致生成失败

- **玩家距离过近或过远**
- **光照条件不符合**
- **空间不足**
- **生物群系或结构不匹配**
- **密度上限已满**
- **碰撞箱被遮挡**
- **生物类型不可生成**

### LC值对刷怪的影响

**LC**(Loaded Chunk)，即玩家所在区块的最大渲染区段高度，一般是16的倍数减1。
在核心步骤中的第2步，选择随机初始点时，会随机在最高的非透明方块所在位置+1与世界底部之间取一个值，作为刷怪初始点的高度。
- 当 LC 值低时，意味着最高遮光方块的纵坐标较低，刷怪初始点可选择的高度范围小，就有更大的概率选到合适的刷怪高度，从而提高刷怪成功率。
- 若 LC 值高，比如刷怪平台建在 y=100 处，那么 y 轴坐标可能是 0-101 之间的任何一个数，选到刚好能刷怪高度的概率就低，刷怪效率自然下降。

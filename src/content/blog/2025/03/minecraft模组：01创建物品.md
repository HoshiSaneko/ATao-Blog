---
title: minecraft模组：01创建物品
date: '2025年03月02日'
tags: ['minecraft']
summary: 本文简要介绍了如何使用Fabric模组在Minecraft中创建自定义物品。
---
### 示例

:::alert{type:info, title:提示}
基于minecraft1.21版本
:::

通过fabric编写模组，创建一个自定义物品`腐烂的苹果`

- 合成：`腐肉`+`苹果`
- 效果：食用后，80%的概率`中毒`

### 新建项目

选择**Minecraft生成器**, 选择对应的minecraft版本，frabic版本及模组名称等

![创建项目](https://cdn.atao.cyou/Blog/blog_250302_222639.png){caption:创建项目}

### 创建物品类

在`main`中创建一个类`RottenApple`来实现自定义物品

```java
public class RottenApple{
    // 创建一个日志记录器
    public static final Logger LOGGER = LoggerFactory.getLogger("MyMod");

    // 定义一个静态的食物组件，用于表示腐烂的食物属性
    public static final FoodComponent ROTTEN_FOOD_COMPONENT = new FoodComponent.Builder()
            .alwaysEdible()
            // 添加中毒状态效果，持续 6 秒（120 游戏刻），等级为 0，触发概率为 80%
            .statusEffect(new StatusEffectInstance(StatusEffects.POISON, 6 * 20, 0), 0.8f)
            .build();

    // 用于在物品上添加自定义的提示信息
    static class CustomToolTip extends Item {
        static String tips;
        public CustomToolTip(Settings settings, String tip) {
            super(settings);
            tips = tip;
        }

        @Override
        public void appendTooltip(ItemStack stack, TooltipContext context, List<Text> tooltip, TooltipType type) {
            tooltip.add(Text.translatable(tips).styled(s -> s.withColor(0x6D4C41)));
        }
    }

    // 定义一个静态的腐烂苹果物品实例, 并通过 register 方法将该物品注册到游戏中
    public static final Item RottenApple = register(
            new CustomToolTip(new Item.Settings().food(ROTTEN_FOOD_COMPONENT), "腐烂的"),
            "rotten_apple"
    );

    // 静态方法，用于注册物品到游戏的物品注册表中
    public static Item register(Item item, String id) {
        // 创建物品的标识符
        Identifier itemID = Identifier.of("mymod", id);
        // 将物品注册到游戏的物品注册表中，并返回注册后的物品实例
        return Registry.register(Registries.ITEM, itemID, item);
    }

    // 初始化
    public static void initialize() {
        // 将物品添加到 FOOD_AND_DRINK 物品组中
        ItemGroupEvents.modifyEntriesEvent(ItemGroups.FOOD_AND_DRINK)
                .register((itemGroup) -> itemGroup.add(RottenApple));

        // 将腐烂苹果物品添加到堆肥机会注册表中，有 30% 的概率增加堆肥器的等级
        CompostingChanceRegistry.INSTANCE.add(RottenApple, 0.3f);

        LOGGER.info("[DEBUG] 物品注册完成");
    }

}
```

在`Mymod`中进行模组初始化

```java
public class Mymod implements ModInitializer {

    @Override
    public void onInitialize() {
        RottenApple.initialize();
    }
}
```

在`gradle`中，选择`fabric`,运行`runClient`，进入游戏。新建游戏后，在物品栏中可以看到我们新建的物品。

![新建的物品](https://cdn.atao.cyou/Blog/blog_250302_232351.png){caption:新建的物品}

但是此时，物品名称和纹理都还没有添加

### 添加翻译

在`main\resources\assets\mymod\lang`文件夹中，新建一个`en_us.json`  (如果文件夹不存在则新建)

写入翻译和名称
```json
{
  "item.mymod.rotten_apple": "RottenApple",
}
```

![添加翻译](https://cdn.atao.cyou/Blog/blog_250302_232827.png){caption:添加翻译}

### 添加纹理和模型

#### 模型

在`main\resources\assets\mymod\models\item`文件夹中，新建一个`rotten_apple.json`(如果文件夹不存在则新建)

写入模型数据

```json
{
  "parent": "item/generated",
  "textures": {
    "layer0": "mymod:item/rotten_apple",
  },
}
```

- **parent**  模型要继承的父模型。大多物品继承的模型是 item/generate, 也有其他的，比如 item/handheld，用于拿在玩家手中的物品，例如工具。
- **textures**  为模型定义纹理的地方。 layer0 是模型使用的纹理。

#### 纹理

将纹理文件放在`main\resources\assets\mymod\textures\item`文件夹中，并命名为`rotten_apple.png`(如果文件夹不存在则新建)

需要注意的是:

- 必须是png格式的文件
- 像素需要是16×16或32×32

![添加模型和纹理](https://cdn.atao.cyou/Blog/blog_250302_234104.png){caption:添加模型和纹理}

### 合成配方

通过`腐肉` + `苹果` 进行无序合成

在`main\resources\data\mymod\recipe`文件夹中，新建一个`rotten_apple.json`(如果文件夹不存在则新建)

写入合成配方(无序合成)

```json
{
  "type": "minecraft:crafting_shapeless",
  "ingredients": [
    {
      "item": "minecraft:rotten_flesh",
    },
    {
      "item": "minecraft:apple",
    },
  ],
  "result": {
    "id": "mymod:rotten_apple",
    "count": 1,
  },
}
```

![合成配方](https://cdn.atao.cyou/Blog/blog_250302_234652.png){caption:合成配方}

### 实现效果

![](https://cdn.atao.cyou/Blog/blog_250303_211828.gif)

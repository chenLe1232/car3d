
# How to use QMerge
#### 依赖 
- framework3D 
- qanim 
#### UI結構
QMerge
    -MergeLayout        --底座布局,用于实列化底座(MergeLayout)
        1               --底座模板(Node[MergeGrid])
            highlight   --底座高亮显示节点(Node/Sprite)
            level       --底座数值节点(Node)
                num     --底座数值显示(Label)
    -Bottom             --下方操作按钮(删除，购买，商店)
    -EntityLayout       --合成体布局
        Entity          --合成体模板(MergeEntity)
    -OutputLayout
        output          --产出资源节点(MergeGrid) ,注意，此节点无法移动
            num         --产出资源显示 (Label)
#### 初始化
##### 存储
持久化数据结构
```
    map: number[] = [1, 1, 0, 0,
        -1, -1, -1, -1,
        -1, -1, -1, -1]
    // 1 表示 id 为 1
    // 0 表示 为空格
    //-1 表示未解锁 
```
初始化代码 
``` 
csv.WeaponInfo.values.forEach(v => {
    let a = {} as MergeEntityData;
    a.id = v.Id;
    a.next = v.Next;
    a.image = "Texture/car_thumbnail/" + v.Icon + ".png";
    this.mergePanel.setEntityData(a.id, a);
})
this.mergePanel.initWithMap(PlayerInfo.map);
``` 
#### 事件列表
1. 解锁 
> QMerge.UnlockGrid 
##### 参数：
    1. #1整个合成系统地图数据
    2. #2grid:MergeGrid

2. 移除
> QMerge.Remove

3. 合成
> QMerge.Merge 
##### 参数：
    1. 合成的最终实体(QMergeEntity)
4. 移动
> QMerge.Move

5. 交换位置 
> QMerge.Switch
##### 参数：
    1.移动到的目标格子(QMergeGrid)
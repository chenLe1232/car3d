enum QMergeEvent {
  Remove = 1,
  Merge,
  Move,
  Switch,
  GridChanged,
  Output, //产出
  Add, //增加到格子
}
export default class QMerge {
  static Event: typeof QMergeEvent = QMergeEvent;
}

// timesignalのトリガーをセットします
function set_trigger() {
  const time_now = new Date();
  const time_timesignal_trigger = new Date(time_now.getFullYear(), time_now.getMonth(), time_now.getDate(), time_now.getHours(), 58);
  try {
    ScriptApp.newTrigger('timesignal').timeBased().at(time_timesignal_trigger).create();
  }
  catch {
    Logger.log('エラー: トリガーが設定できません。すべてのトリガーを削除して、もう一度設定します。');
    const triggers_used = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers_used.length; i++) {
      ScriptApp.deleteTrigger(triggers_used[i]);
    }
    Logger.log('トリガーを削除しました。');
    try {
      ScriptApp.newTrigger('timesignal').timeBased().at(time_timesignal_trigger);
    }
    catch (e) {
      Logger.log(e);
      Logger.log('エラー: トリガーが設定できませんでした。原因は不明です。');
      return;
    }
  }
  Logger.log('timesignalのトリガーを設定しました。');
  Logger.log('設定時刻: ' + time_timesignal_trigger);
}
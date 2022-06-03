function timesignal() {
  const test = true;  // true:テストモード有効

  const prop = PropertiesService.getScriptProperties();
  const sheets_log = SpreadsheetApp.openById('1PWb3ih0KuZmIrJG75yM0LSWZ4vfoLL7wiaoajB88b2o');
  const sheets_comment = SpreadsheetApp.openById('14bS9-K7AXEUOVYcMW4WrXZEHlfvuK2PEmte_qoC-4yc');
  const endpoint_del = 'https://api.twitter.com/1.1/statuses/destroy/***.json';
  const endpoint_post = 'https://api.twitter.com/1.1/statuses/update.json';
  const array_date = new Array('日', '月', '火', '水', '木', '金', '土');
  const min = 60 * 1000;

  function fin() {
    Logger.log('プログラムを終了します。');

    /* time_finに終了時刻を代入 */
    const time_fin = new Date();
    Logger.log('終了時刻: ' + time_fin);

    return;
  }

  /* テストモードの検証(行:1を参照) */
  if (test) Logger.log('これはテストモードです。');

  /* プログラム開始時刻 */
  const time_start = new Date();
  Logger.log('開始時刻: ' + time_start);

  /* 稼働状態の確認 */
  if (sheets_log.getSheets()[0].getRange('B1').getValue() == 1 || test) {
    Logger.log('稼働状況: true');
  }
  else {
    Logger.log('稼働状況: false');
    fin();
    return;
  }

  /* 開始時刻の検証 */
  if (time_start.getMinutes() >= 58 || test) {
    Logger.log('開始時刻の検証が完了しました。');
  }
  else {
    Logger.log('エラー: 開始時刻が適正ではありません。');
    fin();
    return;
  }

  /* TwitterAPI認証 */
  const time_auth_start = new Date();

  const twitter = (() => {
    try {
      return getTwitterService();
    }
    catch {
      Logger.log('エラー: 認証に失敗したため、再度認証を行います。')
      try {
        return getTwitterService();
      }
      catch {
        Logger.log('エラー: 認証に失敗しました。');
        return null;
      }
    }
  })();

  // 認証に失敗したらプログラム終了
  if (!twitter) {
    fin();
    return;
  }

  const time_auth_fin = new Date();

  const time_auth = time_auth_fin - time_auth_start;
  Logger.log('TwitterAPIの認証が完了しました。');
  Logger.log('認証時間: ' + time_auth + 'ms');


  /* 前回の時報ツイートの削除 */
  if (prop.getProperty('tweetid_timesignal_last') && !test) {
    try {
      twitter.fetch(endpoint_del.replace('***', prop.getProperty('tweetid_timesignal_last')), {
        method: 'post'
      });
      Logger.log('前回の時報を削除しました。');
    }
    catch {
      Logger.log('エラー: 前回の時報を削除することができませんでした。');
    }
  }
  else if (!test) {
    Logger.log('プロパティ(tweetid_timesignal_last)に値が入っていませんでした。');
    Logger.log('前回の時報を削除せずに続行します。');
  }

  // プロパティ(tweetid_itmesignal_last)の初期化
  if (!test) {
    prop.setProperty('tweetid_timesignal_last', '');
    Logger.log('プロパティ(tweetid_timesignal_last)を初期化しました。');
  }

  /* 時報のコメントを作成 */
  const time_timesignal = new Date(time_start.setMinutes(time_start.getMinutes() + 2));  // 時報予定時刻を代入
  const year_timesignal = time_timesignal.getFullYear();
  const month_timesignal = time_timesignal.getMonth();
  const date_timesignal = time_timesignal.getDate();
  const day_timesignal = time_timesignal.getDay();
  const hour_timesignal = time_timesignal.getHours();

  const comment = (() => {

    const comment_part_1 = (() => {
      return hour_timesignal == 0
        ? 'らいむが ' + (month_timesignal + 1) + '月' + date_timesignal + '日(' + array_date[day_timesignal] + ') ' + hour_timesignal + '時 をお知らせします。'
        : 'らいむが ' + hour_timesignal + '時 をお知らせします。';
    })();

    const sheet_comment = sheets_comment.getSheets()[0];  // 先頭のシートを取得
    const comment_part_2 = sheet_comment.getRange(hour_timesignal + 2, day_timesignal + 2).getValue();

    switch (comment_part_2.substring(2, 0)) {
      case '/s': return 'stop';
    }

    if (test) return '時報botのテストです。';

    return !comment_part_2
      ? comment_part_1
      : comment_part_1 + '\n\n' + comment_part_2;
  })();

  if(comment == 'stop'){
    Logger.log('ストップコードを返されました。時報は投稿されません。');
    fin();
    return;
  }

  Logger.log('時報のツイート文を作成しました。\n『' + comment + '』');

  /* n時59分59.950まで待機(2段階) */
  Logger.log(new Date().getHours() + '時59分950まで待機します。');

  // n時59分59.750まで待機
  const time_wait_start = new Date();
  const time_wait = (60 * min - 250) - ((time_wait_start.getMinutes() * 60 + time_wait_start.getSeconds()) * 1000 + time_wait_start.getMilliseconds());
  if (!test) Utilities.sleep(time_wait);

  // n時59分59.950まで待機
  while (true) {
    if (new Date().getMilliseconds() == 950 || test) break;
  }

  /* 時報を投稿 */
  const data_timesignal = (() => {
    try {
      return twitter.fetch(endpoint_post, {
        method: 'post',
        payload: {
          status: comment
        }
      });
    }
    catch {
      Logger.log('エラー: 時報を投稿できませんでした。');
      return null;
      // raimusuki baka  aho kaeru
    }
  })();

  if (test) {
    !data_timesignal
      ? Logger.log('エラー: 時報が投稿されませんでした。')
      : Logger.log('時報が投稿されました。');

    fin();
    return;
  }

  const time_timesignal_diffirence = (() => {
    if (!(data_timesignal == null)) {
      Logger.log('時報が投稿されました。')
      const tweetid_timesignal = JSON.parse(data_timesignal).id_str;

      // 時報のtweetidをプロパティ(tweetid_timesignal_last)に記録
      prop.setProperty('tweetid_timesignal_last', tweetid_timesignal);

      // "XX:00:00.000との差を計算"
      const unixtime_timesignal_post = parseInt(tweetid_timesignal / Math.pow(2, 22)) + 1288834974657;
      const time_timesignal_post = new Date(unixtime_timesignal_post);
      const time_timesignal_right = new Date(year_timesignal, month_timesignal, date_timesignal, hour_timesignal, 0, 0);
      Logger.log(hour_timesignal + ':00:00.000との差: ' + (time_timesignal_post - time_timesignal_right) + 'ms');
      return time_timesignal_post - time_timesignal_right;
    }

    return null;
  })();

  /* ログに記録 */
  // 月変更処理
  if (date_timesignal == 1) {
    // 今月のシートを作成
    const thismonth = year_timesignal + '/' + ("0" + (month_timesignal + 1)).slice(-2);
    const sheet_temp = sheets_log.getSheetByName('temp');
    const sheet_new = sheet_temp.copyTo(sheets_log).setName(thismonth).activate();
    sheets_log.moveActiveSheet(1);
    Logger.log('今月(' + thismonth + ')のシートを作成しました。');

    // 先月のシートの処理
    const sheet_lastmonth = sheets_log.getSheets()[1];
    sheet_new.getRange('B1').setValue(sheet_lastmonth.getRange('B1').getValue());
    sheet_lastmonth.getRange('B1').setValue('');
    sheet_lastmonth.getRange('E1').setValue('');

    Logger.log('月変更処理を行いました。');
  }

  const sheet_thismonth = sheets_log.getSheets()[0];

  // 日付変更処理
  if (hour_timesignal == 0) {
    sheet_thismonth.getRange('E1').setValue(date_timesignal);
    sheet_thismonth.getRange(4, date_timesignal + 1).setValue(date_timesignal);
    sheet_thismonth.getRange(32, date_timesignal + 1).setValue(date_timesignal);
    Logger.log('日付変更処理を行いました。');
  }

  // 記録
  // "認証時間 (ms)"を記録
  sheet_thismonth.getRange(hour_timesignal + 33, date_timesignal + 1).setValue(time_auth);

  if (!(data_timesignal == null)) {
    // "投稿時刻の(XX:00:00.000)との差 (ms)"を記録
    sheet_thismonth.getRange(hour_timesignal + 5, date_timesignal + 1).setValue(time_timesignal_diffirence);
  }
  else {
    // "投稿時刻の(XX:00:00.000)との差 (ms)"を記録
    sheet_thismonth.getRange(hour_timesignal + 5, date_timesignal + 1).setValue('E');

    sheet_thismonth.getRange('H1').setValue(sheet_thismonth.getRange('H1').getValue() + 1);
    Logger.log('エラー数に1を加算しました。');
  }
  Logger.log('シート(Log)に記録しました。');

  fin();
  return;
}

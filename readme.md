# javier-spreadsheets

標準入力から CSV を受け取り、 Google Spreadsheets へ反映する CLI ツールです。

# Prerequesties

## 1 credentials を手に入れて、配置する

### 1 - 1 ~/.javier_spreadsheets_credentials.json に配置する 

### 1 - 2 環境変数 JAVIER_SPREADSHEETS_CREDS_PATH を指定する 

## 2 javier-spreadsheets setup を実行する 

```
javier-spreadsheets setup 
```

## 3 テスト実行する 

適当な Google Spreadsheets ファイルの URL と Range (シート名と範囲の組) を用意すること。 

```
echo "1, 2" | javier-spreadsheets update https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/edit#gid=0 'Sheet 1!A1'
```

# Tips 

## jq と組み合わせて、 JSON を CSV に変換して Google Spreadsheets へ反映する。

例えば、 Slack API の conversations.list の返り値の内容を使う場合。以下のような json ファイルをもとに作業を進めるとして、 

```conversations.list.json
{
  "ok": true,
  "channels": [
    {
      "id": "C00ABCDEF",
      "name": "random",
      "is_channel": true,
      "is_group": false,
      "is_im": false,
      "created": 1452174102,
      "is_archived": false,
      "is_general": false,
      "unlinked": 0,
      "name_normalized": "random",
      "is_shared": false,
      "parent_conversation": null,
      "creator": "U00ABCDEF",
      "is_ext_shared": false,
      "is_org_shared": false,
      "shared_team_ids": [
        "T00ABCDEF"
      ],
      "pending_shared": [],
      "pending_connected_team_ids": [],
      "is_pending_ext_shared": false,
      "is_member": false,
      "is_private": false,
      "is_mpim": false,
      "topic": {
        "value": "雑談チャンネルです",
        "creator": "U00ABCDEF",
        "last_set": 1560686578
      },
      "num_members": 6880
    },
    {
      "id": "C01ABCDEF",
      "name": "development",
      "is_channel": true,
      "is_group": false,
      "is_im": false,
      "created": 1452174102,
      "is_archived": false,
      "is_general": true,
      "unlinked": 0,
      "name_normalized": "development",
      "is_shared": false,
      "parent_conversation": null,
      "creator": "U01ABCDEF",
      "is_ext_shared": false,
      "is_org_shared": false,
      "shared_team_ids": [
        "T01ABCDEF"
      ],
      "pending_shared": [],
      "pending_connected_team_ids": [],
      "is_pending_ext_shared": false,
      "is_member": false,
      "is_private": false,
      "is_mpim": false,
      "topic": {
        "value": "developers",
        "creator": "U01ABCDEF",
        "last_set": 1571620610
      },
      "num_members": 18434
    },
```

この JSON ファイルから channels の中の name と num_members を取り出す場合は以下のように

```
cat conversations.list.json | jq -r '.channels[] | [.name, .num_members] | @csv' | javier-spreadsheets update https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/edit 'Sheet 1!A1'
```

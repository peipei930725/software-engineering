切換 branch:
使用 git fetch 來找到 branch
用 git checkout Development_1 來切換 branch

| 分支名稱        | 用途                                     |
| --------------- | ---------------------------------------- |
| `main`          | 穩定版，可部署與發表版本（禁止直接推送） |
| `Development_1` | 組員整合每日進度，合併後測試             |

- ❌ 不可直接 push 到 `main`
- ❌ 不可 commit `.env`、帳密等敏感資訊
- ❌ 不可修改別人檔案不通知
- ❌ 不可強制 push（使用 `--force`）

各種更新請不要在 main 上做更新!!!!

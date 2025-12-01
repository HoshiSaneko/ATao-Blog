---
title: 填充联系人、通话记录、短信的方法
date: '2025年01月13日'
tags: ['Android']
summary: 介绍如何在Android中添加联系人、通话记录和短信，包含实现方法和注意事项。
---
## 前提

在`Android自动化测试`中，通过自动化测试脚本填充`联系人`、`通话记录`、`短信`等数据，可以模拟出更接近真实用户的使用场景。这种模拟有助于发现那些在日常使用中才会出现的问题，从而提高测试的全面性和准确性。

## 实现方法

### 联系人

#### 权限

- 读写联系人需要以下权限，直接动态申请即可

```xml
<uses-permission android:name="android.permission.READ_CONTACTS"/>
<uses-permission android:name="android.permission.WRITE_CONTACTS"/>
```

#### 填充方法

```java
private boolean insertContacts(String names, String num) {
    // 创建一个操作列表
    ArrayList<ContentProviderOperation> ops = new ArrayList<>();
    ops.add(ContentProviderOperation.newInsert(ContactsContract.RawContacts.CONTENT_URI) // 插入一个新的原始联系人记录
            .withValue(ContactsContract.RawContacts.ACCOUNT_TYPE, null) // 账户类型为空，表示这是一个本地联系人
            .withValue(ContactsContract.RawContacts.ACCOUNT_NAME, null) // 账户名称为空，表示这是一个本地联系人
            .build());

    ops.add(ContentProviderOperation.newInsert(ContactsContract.Data.CONTENT_URI)  // 插入联系人的姓名数据
            .withValueBackReference(ContactsContract.Data.RAW_CONTACT_ID, 0)   // 引用前面插入的原始联系人 ID
            .withValue(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.StructuredName.CONTENT_ITEM_TYPE) // 指定数据类型为姓名
            .withValue(ContactsContract.CommonDataKinds.StructuredName.DISPLAY_NAME, names) // 设置联系人姓名
            .build());

    ops.add(ContentProviderOperation.newInsert(ContactsContract.Data.CONTENT_URI)   // 插入联系人的电话号码数据
            .withValueBackReference(ContactsContract.Data.RAW_CONTACT_ID, 0)  // 引用前面插入的原始联系人 ID
            .withValue(ContactsContract.Data.MIMETYPE, ContactsContract.CommonDataKinds.Phone.CONTENT_ITEM_TYPE)   // 指定数据类型为电话号码
            .withValue(ContactsContract.CommonDataKinds.Phone.NUMBER, num)  // 设置电话号码
            .withValue(ContactsContract.CommonDataKinds.Phone.TYPE, ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE)  // 设置电话号码类型为移动电话
            .build());

    try {
        getContentResolver().applyBatch(ContactsContract.AUTHORITY, ops);   // 执行批量插入操作
        return true;
    } catch (Exception e) {
        Log.e(TAG, "insertContacts error: " + e);
        return false;
    }
}
```

#### 删除方法

```java
private void deleteAllContacts() {
    Uri uri = ContactsContract.Contacts.CONTENT_URI;
    String[] projection = new String[]{ContactsContract.Contacts._ID};  // 只查询联系人的 ID
    String selection = null;  // 定义查询条件，这里为空表示查询所有联系人
    String[] selectionArgs = null;
    String sortOrder = ContactsContract.Contacts.DISPLAY_NAME + " COLLATE LOCALIZED ASC";  // 按显示名称升序排序

    // 查询所有联系人的 ID
    Cursor cursor = getContentResolver().query(uri, projection, selection, selectionArgs, sortOrder);
    if (cursor != null) {
        try {
            while (cursor.moveToNext()) {
                // 获取联系人的 ID 并尝试删除
                @SuppressLint("Range") long contactId = cursor.getLong(cursor.getColumnIndex(ContactsContract.Contacts._ID));
                if (deleteContact(contactId)) {
                    Log.d(TAG, String.format("delete contact %s succ\n", contactId));
                } else {
                    Log.e(TAG, String.format("delete contact %s fail\n", contactId));
                }
            }
        } finally {
            cursor.close();
        }
    }
}

private boolean deleteContact(long contactId) {
    try {
        Uri deleteUri = ContentUris.withAppendedId(ContactsContract.Contacts.CONTENT_URI, contactId);  // 构建删除 URI
        int rowsDeleted = getContentResolver().delete(deleteUri, null, null);  // 执行删除操作
        if (rowsDeleted > 0) {
            return true;
        }
    } catch (Exception e) {
        Log.e(TAG, "deleteContactError: " + e);
    }
    return false;
}
```

### 通话记录

#### 权限

- 读写通话记录需要以下权限，直接动态申请即可

```xml
<uses-permission android:name="android.permission.READ_CALL_LOG"/>
<uses-permission android:name="android.permission.WRITE_CALL_LOG"/>
```

#### 填充方法

```java
private boolean insertCallLog(String number, String duration, String type, String isNew) {
    ContentValues values = new ContentValues();
    values.put(CallLog.Calls.NUMBER, number);  // 通话号码
    values.put(CallLog.Calls.DATE, System.currentTimeMillis());  // 通话日期
    values.put(CallLog.Calls.DURATION, duration);  // 通话时长
    values.put(CallLog.Calls.TYPE, type); // 通话类型（呼入、呼出、未接）
    values.put(CallLog.Calls.NEW, isNew);  // 是否为新通话记录
    try {
        getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
        return true;
    } catch (Exception e) {
        Log.e(TAG, "insertCallLog error: " + e);
        return false;
    }
}
```

#### 删除方法

```java
private boolean deleteAllCallLogs() {
    try {
        // 删除所有通话记录
        int rowsDeleted = getContentResolver().delete(CallLog.Calls.CONTENT_URI, null, null);
         // 如果删除的记录数大于 0，表示删除成功
        if (rowsDeleted > 0) {
            return true;
        }
    } catch (Exception e) {
        Log.e(TAG, "deleteAllCallLogs error: " + e);
    }
    return false;
}
```

### 短信

#### 权限

- 短信较为特殊，由于[Android4.4](https://developer.android.com/guide/topics/permissions/default-handlers?hl=zh-cn){material-symbols:android}之后，除了`默认短信应用`以外，其他应用将无法插入短信。因此需要将APK`伪装`成一个短信应用，并设置为默认的短信应用。

**AndroidManifest.xml**中添加

```xml
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS"/>
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
    tools:ignore="QueryAllPackagesPermission" />

<application
    android:allowBackup="true"
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:fullBackupContent="@xml/backup_rules"
    android:icon="@mipmap/app"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/app_round"
    android:supportsRtl="true"
    android:theme="@style/Theme.AutoFill"
    >
    <receiver
        android:name=".SmsReceiver"
        android:permission="android.permission.BROADCAST_SMS"
        android:exported="true"
        tools:ignore="WrongManifestParent">
        <intent-filter>
            <action android:name="android.provider.Telephony.SMS_DELIVER" />
        </intent-filter>
    </receiver>
    <receiver
        android:name=".MmsReceiver"
        android:permission="android.permission.BROADCAST_WAP_PUSH"
        android:exported="true"
        tools:ignore="WrongManifestParent">
        <intent-filter>
            <action android:name="android.provider.Telephony.WAP_PUSH_DELIVER" />
            <data android:mimeType="application/vnd.wap.mms-message" />
        </intent-filter>
    </receiver>
    <service
        android:name=".HeadlessSmsSendService"
        android:exported="true"
        android:permission="android.permission.SEND_RESPOND_VIA_MESSAGE"
        tools:ignore="WrongManifestParent">
        <intent-filter>
            <action android:name="android.intent.action.RESPOND_VIA_MESSAGE" />
            <category android:name="android.intent.category.DEFAULT" />

            <data android:scheme="sms" />
            <data android:scheme="smsto" />
            <data android:scheme="mms" />
            <data android:scheme="mmsto" />
        </intent-filter>
    </service>
    <activity
        android:name=".MainActivity"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.SEND" />
            <action android:name="android.intent.action.SENDTO" />

            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />

            <data android:scheme="sms" />
            <data android:scheme="smsto" />
            <data android:scheme="mms" />
            <data android:scheme="mmsto" />
        </intent-filter>
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

- 分别创建空的**HeadlessSmsSendService**，**MmsReceiver**，**SmsActivity**，**SmsReceiver**，**SmsService**

```java
public class HeadlessSmsSendService extends Service {
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
public class MmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
    }
}
public class SmsActivity extends Activity {
}
public class SmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
    }
}
public class SmsReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
    }
}
```

![创建所须的类](https://cdn.atao.cyou/Blog/blog_250116_232142.png){caption:创建所须的类}

- 最后，需要将APK设置为默认短信应用(需要手动授予)

```java
// 获取当前设备上默认的短信应用的包名
private String getDefaultSms()
{
    String packageName = "null";
    Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:"));
    PackageManager packageManager = getApplicationContext().getPackageManager();
    ResolveInfo resolveInfo = packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
    if (resolveInfo != null) {
        packageName = resolveInfo.activityInfo.packageName;
    }
    return packageName;
}

// 设置当前应用为默认短信应用
private void setDefaultSms(int requestCode) {
    String defaultSmsPkg = Telephony.Sms.getDefaultSmsPackage(getApplicationContext());
    Log.d(TAG, "default SMS: " + defaultSmsPkg);
    if (!defaultSmsPkg.equals(getPackageName())) {
        RoleManager roleManager = (RoleManager) getSystemService(Context.ROLE_SERVICE);
        if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_SMS)) {
            Intent roleRequestIntent = roleManager.createRequestRoleIntent(RoleManager.ROLE_SMS);
            if (roleRequestIntent != null) {
                startActivityForResult(roleRequestIntent, requestCode);  // 启动请求设置默认短信的活动
            }
        }
    }
}

protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    // 通过判断requestCode的值来确定是哪个操作触发的结果回调
    // 默认短信应用设置结果可以在这里判断
}
```

#### 填充方法

```java
private void insertMessages(String num, String body, long date) {
    ContentResolver contentResolver = getContentResolver();
    ContentValues values = new ContentValues();
    Uri uri = Uri.parse("content://sms/");
    values.put(Telephony.Sms.ADDRESS, num);
    values.put(Telephony.Sms.DATE, date);
    values.put(Telephony.Sms.READ, false);
    values.put(Telephony.Sms.STATUS, Telephony.Sms.STATUS_NONE);
    values.put(Telephony.Sms.BODY, body);
    contentResolver.insert(uri, values);
}
```

#### 删除方法

```java
private void deleteAllSMS() {
    Uri uriSms = Uri.parse("content://sms/");
    Cursor c = getContentResolver().query(uriSms, null, null, null, null);

    while (c.moveToNext()) {
        long id = c.getLong(c.getColumnIndexOrThrow("_id"));
        getContentResolver().delete(Uri.parse("content://sms/" + id), null, null);
    }
    c.close();
}
```

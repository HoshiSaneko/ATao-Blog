---
title: 获取APK相关信息
date: '2025年01月13日'
tags: ['代码片段', 'Android']
summary: 介绍如何在Android中获取APP相关信息，包括实现方法和常见应用场景
---
## 前提

Android中APK部分信息通过`adb`无法直接获取，但是可以通过Android中的[ApplicationInfo](https://developer.android.com/reference/android/content/pm/ApplicationInfo){eos-icons:api}接口进行获取。

## 获取内容

- **packageName**：应用的包名，唯一标识每个APP
- **appName**：应用的名称，用户在界面上看到的名字
- **isSystemApp**：是否为系统应用，区分预装和用户安装
- **launcherActivity**：应用的启动Activity类名
- **processName**：应用运行的进程名称
- **compileSdkVersion**：编译时所用的SDK版本
- **targetSdkVersion**：目标适配的SDK版本
- **icon**：应用的图标数据

## 功能实现

### 权限

```xml
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES"
    tools:ignore="QueryAllPackagesPermission" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="32"
    tools:ignore="ScopedStorage" />
```

### MainActivity(入口)

```java
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    private static final int REQUEST_PERMISSIONS = 1122;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        // 获取应用程序的名称和图标
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQUEST_PERMISSIONS);
        }
        Thread backgroundThread = new Thread(new Runnable() {
            @Override
            public void run() {
                // 权限已经被授予，可以保存应用信息
                try {
                    AppInfoManager.saveInstalledAppsInfo(MainActivity.this);
                } catch (ClassNotFoundException | NoSuchMethodException e) {
                    throw new RuntimeException(e);
                }
            }
        });
        backgroundThread.start();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_PERMISSIONS) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // 权限被授予，可以保存应用信息
            } else {
                // 权限被拒绝，提示用户权限未被授予
                Log.d(TAG, "权限被拒绝");
            }
        }
    }
}
```

### AppInfoManager（核心部分）

```java
public class AppInfoManager {
    public static String TAG = "APPInfoManager";

    public static void saveInstalledAppsInfo(Context context) throws ClassNotFoundException, NoSuchMethodException {
        PackageManager packageManager = context.getPackageManager();
        List<ApplicationInfo> apps = packageManager.getInstalledApplications(0);

        DatabaseHelper dbHelper = new DatabaseHelper(context);
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        for (ApplicationInfo app : apps) {
            // 获取包名
            String packageName = app.packageName;
            Log.d(TAG, app.packageName);
            String name = (String) app.loadLabel(packageManager);  // 应用的用户可见名称
            // 检查应用名是否已经存在于数据库中
            if (dbHelper.appNameExists(name)) {
                Log.d(TAG, String.format("%s exists", name));
                continue;
            }
            // 获取应用的各种标志
            int flags = app.flags;
            // 是否是系统应用
            boolean isSystemApp = (flags & ApplicationInfo.FLAG_SYSTEM) != 0;
            int compileSdkVersion = app.compileSdkVersion;
            int targetSdkVersion = app.targetSdkVersion;
            // 进程名称
            String processName = app.processName;

            // 获取启动活动名
            String launcherActivity = "";
            Intent intent = packageManager.getLaunchIntentForPackage(packageName);
            if (intent != null) {
                // 从Intent中获取启动Activity的组件信息
                ComponentName componentName = intent.getComponent();
                launcherActivity = componentName.getClassName(); // 启动Activity的类名
            }
            Drawable icon = app.loadIcon(packageManager);
            // 获取应用图标
            Bitmap bitmap = getBitmapFromDrawable(icon);
            // 将图标转换为可以存储到数据库中的字节数据
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos);
            byte[] iconBytes = baos.toByteArray();

            // 将数据保存到数据库
            ContentValues values = new ContentValues();
            values.put("packageName", packageName);
            values.put("appName", name);
            values.put("isSystemApp", isSystemApp);
            values.put("launcherActivity", launcherActivity);
            values.put("processName", processName);
            values.put("compileSdkVersion", compileSdkVersion);
            values.put("targetSdkVersion", targetSdkVersion);
            values.put("icon", iconBytes);
            db.insert("apps", null, values);
            Log.d(TAG, String.format("%s saved", name));
        }

        db.close();
        writeFinishedFlag(context);
    }

    private static Bitmap getBitmapFromDrawable(Drawable drawable) {
        if (drawable instanceof BitmapDrawable) {
            return ((BitmapDrawable) drawable).getBitmap();
        } else if (drawable instanceof AdaptiveIconDrawable) {
            Drawable backgroundDr = ((AdaptiveIconDrawable) drawable).getBackground();
            Drawable foregroundDr = ((AdaptiveIconDrawable) drawable).getForeground();
            // 添加非空检查
            if (backgroundDr != null && foregroundDr != null) {
                Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                Canvas canvas = new Canvas(bitmap);
                backgroundDr.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                foregroundDr.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                backgroundDr.draw(canvas);
                foregroundDr.draw(canvas);
                return bitmap;
            } else{
                // 创建一个完全透明的 ARGB_8888 格式的 Bitmap
                return Bitmap.createBitmap(64, 64, Bitmap.Config.ARGB_8888);
            }
        } else {
            // Fallback for other types of drawables (e.g., ColorDrawable, VectorDrawable)
            Bitmap bitmap = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);
            drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            drawable.draw(canvas);
            return bitmap;
        }
    }

    private static void writeFinishedFlag(Context context) {
        File file = new File(Objects.requireNonNull(context.getExternalFilesDir(null)).getAbsolutePath(), "result.txt");
        try (FileWriter writer = new FileWriter(file)) {
            writer.write("1");
        } catch (IOException e) {
            Log.d(TAG, "writeFinishedFlag: ", e);
        }
    }
}
```

### DatabaseHelper（数据保存）

```java
public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "appInfo.db";
    private static final String TABLE_NAME = "apps";
    private static final int DATABASE_VERSION = 1;

    private static final String CREATE_TABLE_APPS =
            "CREATE TABLE " + TABLE_NAME +
                    "(_id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "packageName TEXT, " +
                    "appName TEXT," +
                    "isSystemApp INTEGER," +
                    "launcherActivity TEXT," +
                    "processName TEXT," +
                    "compileSdkVersion INTEGER," +
                    "targetSdkVersion INTEGER," +
                    "icon BLOB);";

    public DatabaseHelper(Context context) {
        super(context, context.getExternalFilesDir(null).getAbsolutePath() +
                "/" + DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(CREATE_TABLE_APPS);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Handle database version upgrades if necessary
    }

    public boolean appNameExists(String appName) {
        SQLiteDatabase db = getReadableDatabase();
        String query = "SELECT * FROM " + TABLE_NAME + " WHERE appName = ?";
        Cursor cursor = db.rawQuery(query, new String[]{appName});
        boolean exists = cursor.moveToFirst();
        cursor.close();
        return exists;
    }

}
```

## 使用方法

:::timeline
@item 第一步 | 安装APK

```bash
adb install -g app-debug.apk # 通过-g参数授予全部权限"
```

@item 第二步 | 启动APK

```bash
adb shell am start -n com.tt.appinfo/.MainActivity
```

@item 第三步 | 等待获取完成

```bash
adb shell cat /sdcard/Android/data/com.tt.appinfo/files/result.txt # 结果为1时，获取完成
```

@item 第四步 | 导出数据

```bash
adb pull /sdcard/Android/data/com.tt.appinfo/files/appInfo.db
```

@item 第五步 | 解析数据

可通过[SQLite在线查看](https://www.strerr.com/cn/sqliteviewer.html){hugeicons:sql}临时查看数据
![临时查看结果](https://cdn.atao.cyou/Blog/blog_250116_232352.png){caption:临时查看结果}
:::

### python解析示例

```python
if __name__ == "__main__":
    conn = sqlite3.connect('appInfo.db')
    cursor = conn.cursor()
    cursor.execute("SELECT _id, packageName, appName, isSystemApp, launcherActivity, processName, compileSdkVersion, targetSdkVersion, icon FROM apps")
    rows = cursor.fetchall()
    appInfos = {}
    for row in rows:
        packageName = row[1]
        appName = row[2]
        isSystemApp = row[3]
        launcherActivity = row[4]
        processName = row[5]
        compileSdkVersion = row[6]
        targetSdkVersion = row[7]
        icon = row[8]
        if packageName in appInfos.keys():
            continue
        appInfos[packageName] = {
            "appName": appName,
            "isSystemApp": isSystemApp,
            "launcherActivity": launcherActivity,
            "processName": processName,
            "compileSdkVersion": compileSdkVersion,
            "targetSdkVersion": targetSdkVersion,
            "icon": icon,
        }

    if not os.path.exists("Icons"):
        os.mkdir("Icons")

    for package in appInfos.keys():
        appName = appInfos[package]["appName"]
        isSystemApp = appInfos[package]["isSystemApp"]
        launcherActivity = appInfos[package]["launcherActivity"]
        processName = appInfos[package]["processName"]
        compileSdkVersion = appInfos[package]["compileSdkVersion"]
        targetSdkVersion = appInfos[package]["targetSdkVersion"]

        print(f"[{package}]appName: {appName}")
        print(f"[{package}]isSystemApp: {isSystemApp}")
        print(f"[{package}]launcherActivity: {launcherActivity}")
        print(f"[{package}]processName: {processName}")
        print(f"[{package}]compileSdkVersion: {compileSdkVersion}")
        print(f"[{package}]targetSdkVersion: {targetSdkVersion}")

        iconData = appInfos[package]['icon']
        with open(f'Icons/{package}.png', 'wb') as f:
            f.write(iconData)
        print(f"{package} saved")
```

### C#解析示例

```c#
private void LoadAppInfo()
{
    string connectionString = "Data Source=appInfo.db;";
    using var conn = new SqliteConnection(connectionString);
    conn.Open();
    string sql = "SELECT _id, packageName, appName, isSystemApp, launcherActivity, processName, compileSdkVersion, targetSdkVersion, icon FROM apps";
    using var cmd = new SqliteCommand(sql, conn);
    using (var reader = cmd.ExecuteReader())
    {
        var appInfos = new Dictionary<string, Dictionary<string, object>>();

        while (reader.Read())
        {
            string packageName = reader.GetString(reader.GetOrdinal("packageName"));
            string appName = reader.GetString(reader.GetOrdinal("appName"));
            bool isSystemApp = reader.GetBoolean(reader.GetOrdinal("isSystemApp"));
            string launcherActivity = reader.GetString(reader.GetOrdinal("launcherActivity"));
            string processName = reader.GetString(reader.GetOrdinal("processName"));
            int compileSdkVersion = reader.GetInt32(reader.GetOrdinal("compileSdkVersion"));
            int targetSdkVersion = reader.GetInt32(reader.GetOrdinal("targetSdkVersion"));
            byte[]? iconData = reader.IsDBNull(reader.GetOrdinal("icon")) ? null : (byte[])reader.GetValue(reader.GetOrdinal("icon"));

            if (appInfos.ContainsKey(packageName))
            {
                continue;
            }

            appInfos[packageName] = new Dictionary<string, object>
                    {
                        {"appName", appName},
                        {"isSystemApp", isSystemApp},
                        {"launcherActivity", launcherActivity},
                        {"processName", processName},
                        {"compileSdkVersion", compileSdkVersion},
                        {"targetSdkVersion", targetSdkVersion},
                        {"iconData", iconData}
                    };

            Log.Info($"[{packageName}]appName: {appName}");
            Log.Info($"[{packageName}]isSystemApp: {isSystemApp}");
            Log.Info($"[{packageName}]launcherActivity: {launcherActivity}");
            Log.Info($"[{packageName}]processName: {processName}");
            Log.Info($"[{packageName}]compileSdkVersion: {compileSdkVersion}");
            Log.Info($"[{packageName}]targetSdkVersion: {targetSdkVersion}");

            string iconsDir = "Icons";
            if (!Directory.Exists(iconsDir))
            {
                Directory.CreateDirectory(iconsDir);
            }

            string iconPath = Path.Combine(iconsDir, $"{packageName}.png");
            if (iconData != null)
            {
                File.WriteAllBytes(iconPath, iconData);
            }
            Log.Info($"{packageName} saved");
        }
    }
}
```

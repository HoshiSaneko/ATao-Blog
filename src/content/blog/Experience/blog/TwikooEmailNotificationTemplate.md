---
title: twikoo邮件通知模板
date: '2025年09月13日'
tags: ['经验分享']
summary: 本文主要分享twikoo中邮件通知模板
---
### 写在前面

样式主要参考了[kzhik](https://www.kzhik.cn/friends?atk_comment=57&atk_notify_key=XVS5D)的通知样式，很好看!

![kzhik的通知样式](https://cdn.atao.cyou/Blog/blog_250913_224355.png){caption:kzhik的通知样式, width:80%}

### MAIL_TEMPLATE

```html
<div
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div
        style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; background-color: #ffffff;">
        <!-- 头部区域 -->
        <div
            style="background-color: #f8db8f; padding: 20px; color: white; display: flex; align-items: center; justify-content: center; gap: 20px;">
            <div style="text-align: center;">
                <div
                    style="font-size: 28px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 26px;">👋</span> Hi ${PARENT_NICK} </div>
                <div style="margin-top: 10px; font-size:16px;"> 您在 <a href="${SITE_URL}"
                        style="color: white; text-decoration: underline; font-weight: 500;">${SITE_NAME}</a> 中收到一条新回复！
                </div>
            </div> <!-- 右侧图片 --> <img src="https://cdn.atao.cyou/Web/web_250913_194213.png"
                style="display:block; max-width:100px;">
        </div> <!-- 内容区域 -->
        <div style="padding: 25px 20px;"> <!-- 原评论部分 -->
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; margin-bottom: 10px; color: #333; font-size: 16px;">您发表的评论：</div>
                <div style="background-color: #f5f7fa; border-radius: 6px; padding: 15px; border: 1px solid #ebf0f5;">
                    <div style="color: #f8db8f; font-weight: 500; margin-bottom: 8px;">@${PARENT_NICK}:</div>
                    <div style="color: #333; line-height: 1.6;">
                        <div style="margin-bottom: 5px;">${PARENT_COMMENT}</div>
                    </div>
                </div>
            </div> <!-- 收到的回复部分 -->
            <div style="margin-bottom: 30px;">
                <div style="font-weight: bold; margin-bottom: 10px; color: #333; font-size: 16px;">您收到的回复</div>
                <div style="background-color: #f5f7fa; border-radius: 6px; padding: 15px; border: 1px solid #ebf0f5;">
                    <div style="color: #f8db8f; font-weight: 500; margin-bottom: 8px;">@${NICK}:</div>
                    <div style="color: #333; line-height: 1.6;">${COMMENT}</div>
                </div>
            </div> <!-- 回复按钮 -->
            <div style="margin-bottom: 30px;"> <a href="${POST_URL}"
                    style="display: inline-block; background-color: #f8db8f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 500;">回复</a>
            </div> <!-- 系统提示 -->
            <div
                style="color: #86909c; font-size: 12px; text-align: center; padding-top: 15px; border-top: 1px solid #ebf0f5;">
                此邮件由系统发送，请不要回复此邮件 </div>
        </div>
    </div>
</div>
```

样式参考:
![MAIL_TEMPLATE样式](https://cdn.atao.cyou/Blog/blog_250913_224556.png){caption:MAIL_TEMPLATE样式}

### MAIL_TEMPLATE_ADMIN

```html
<div
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div
        style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; background-color: #ffffff;">
        <!-- 头部区域 -->
        <div
            style="background-color: #f8db8f; padding: 20px; color: white; display: flex; align-items: center; justify-content: center; gap: 20px;">
            <div style="text-align: center;">
                <div
                    style="font-size: 28px; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-size: 26px;">👋</span> Hi ATao </div>
                <div style="margin-top: 10px; font-size:16px;"> 您在 <a href="${SITE_URL}"
                        style="color: white; text-decoration: underline; font-weight: 500;">${SITE_NAME}</a> 中收到一条新的评论！
                </div>
            </div> <!-- 右侧图片 --> <img src="https://cdn.atao.cyou/Web/web_250913_213324.png"
                style="display:block; max-width:100px;">
        </div> <!-- 内容区域 -->
        <div style="padding: 25px 20px;"> <!-- 原评论部分 -->
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; margin-bottom: 10px; color: #333; font-size: 16px;">评论内容：</div>
                <div style="background-color: #f5f7fa; border-radius: 6px; padding: 15px; border: 1px solid #ebf0f5;">
                    <div style="color: #f8db8f; font-weight: 500; margin-bottom: 8px;">@${NICK}:</div>
                    <div style="color: #333; line-height: 1.6;">
                        <div style="margin-bottom: 5px;">${COMMENT}</div>
                    </div>
                </div>
            </div> <!-- 回复按钮 -->
            <div style="margin-bottom: 30px;"> <a href="${POST_URL}"
                    style="display: inline-block; background-color: #f8db8f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 500;">回复</a>
            </div> <!-- 系统提示 -->
            <div
                style="color: #86909c; font-size: 12px; text-align: center; padding-top: 15px; border-top: 1px solid #ebf0f5;">
                此邮件由系统发送，请不要回复此邮件 </div>
        </div>
    </div>
</div>
```

样式参考:
![MAIL_TEMPLATE样式](https://cdn.atao.cyou/Blog/blog_250913_224612.png){caption:MAIL_TEMPLATE样式}

### 其他

一开始配置了`MAIL_TEMPLATE_ADMIN`，但无论如何测试都无法收到邮件。由于我的Twikoo是通过Docker部署的，通过查看日志发现了原因：

```txt
9/12/2025, 2:05:18 PM Twikoo: 存在即时消息推送配置，默认不发送邮件给博主，您可以在管理面板修改此行为
```

原来是因为我配置了`即时通知`功能，导致Twikoo默认不发送邮件通知。取消该配置后，邮件通知功能就恢复正常了。

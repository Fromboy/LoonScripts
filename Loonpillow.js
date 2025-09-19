// PillowUnlock.js - Pillow 订阅解锁脚本（专为 Loon 优化）

// 初始化返回对象
const Q = {};

// 解析响应体（响应脚本模式）
const Q1 = JSON.parse(typeof $response != "undefined" && $response.body || null);

// 请求脚本：清理 ETag（防止缓存干扰）
if (typeof $response == "undefined") {
  delete $request.headers["x-revenuecat-etag"];
  delete $request.headers["X-RevenueCat-ETag"];
  Q.headers = $request.headers;
  console.log('Pillow: Modified request headers - Removed ETag');
  $done(Q);
  return;
}

// 响应脚本：修改订阅信息
if (Q1 && Q1.subscriber) {
  // 初始化 subscriptions 和 entitlements
  Q1.subscriber.subscriptions = Q1.subscriber.subscriptions || {};
  Q1.subscriber.entitlements = Q1.subscriber.entitlements || {};

  // 调试日志：输出 User-Agent 和 JSON 预览
  console.log('Pillow: User-Agent:', $request.headers['user-agent']);
  console.log('Pillow: Raw response preview:', $response.body.substring(0, 500));

  // Pillow 的订阅配置
  const pillowMapping = {
    name: 'premium',  // 权益名称
    id: 'com.neybox.pillow.premium.yearly'  // 订阅 ID
  };

  // 订阅数据
  const data = {
    "expires_date": "2999-12-31T12:00:00Z",
    "original_purchase_date": "2023-09-01T11:00:00Z",
    "purchase_date": "2023-09-01T11:00:00Z",
    "ownership_type": "PURCHASED",
    "store": "app_store"
  };

  // 检查 User-Agent 是否匹配 Pillow
  const UA = $request.headers['user-agent'];
  if (UA.includes('Pillow')) {
    Q1.subscriber.subscriptions[pillowMapping.id] = data;
    Q1.subscriber.entitlements[pillowMapping.name] = JSON.parse(JSON.stringify(data));
    Q1.subscriber.entitlements[pillowMapping.name].product_identifier = pillowMapping.id;
    console.log(`Pillow: Modified subscription for ${pillowMapping.id}`);
  } else {
    console.log('Pillow: User-Agent mismatch, expected "Pillow", got:', UA);
  }

  Q.body = JSON.stringify(Q1);
} else {
  console.log('Pillow: Error - Invalid JSON structure or missing subscriber');
}

// 返回修改结果
$done(Q);

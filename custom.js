function main(config) {
  // 获取所有代理节点
  const allProxies = config.proxies || [];

  // 地区过滤规则：会根据订阅内实际节点动态生成地区组，避免空分组。
  const regionFilters = {
    "美国节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png",
      filter: "(?i)美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States"
    },
    "香港节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png",
      filter: "(?i)港|HK|hk|Hong Kong|HongKong|hongkong"
    },
    "台湾节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png",
      filter: "(?i)台|新北|彰化|TW|Taiwan"
    },
    "狮城节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png",
      filter: "(?i)新加坡|坡|狮城|SG|Singapore"
    },
    "日本节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png",
      filter: "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan"
    },
    "韩国节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png",
      filter: "(?i)KR|Korea|KOR|首尔|韩|韓"
    }
  };

  const stripInlineIgnoreCase = (pattern) => pattern.replace(/\(\?i\)/g, "");
  const toJsRegex = (pattern) => new RegExp(stripInlineIgnoreCase(pattern), "i");
  const proRegex = /Pro/i;
  const toProGroupName = (regionName) => `${regionName}Pro`;
  const toProRegionFilter = (regionFilter) => {
    const regionBody = stripInlineIgnoreCase(regionFilter);
    return `(?i)(Pro.*(${regionBody})|(${regionBody}).*Pro)`;
  };
  const isProNode = (proxy) => proxy && proxy.name && proRegex.test(proxy.name);

  const availableRegions = [];
  const availableProRegions = [];
  const regionAndOther = [];

  for (const [regionName, regionConfig] of Object.entries(regionFilters)) {
    const regex = toJsRegex(regionConfig.filter);
    const matchedProxies = allProxies.filter((proxy) => proxy && proxy.name && regex.test(proxy.name));
    const proProxies = matchedProxies.filter((proxy) => isProNode(proxy));

    if (matchedProxies.length > 0) {
      availableRegions.push(regionName);
      regionAndOther.push(regionName);
    }
    if (proProxies.length > 0) {
      const proGroupName = toProGroupName(regionName);
      availableProRegions.push(proGroupName);
      regionAndOther.push(proGroupName);
    }
  }

  const excludePatternBody = Object.values(regionFilters)
    .map((regionConfig) => stripInlineIgnoreCase(regionConfig.filter))
    .join("|");
  const otherRegex = new RegExp(excludePatternBody, "i");
  const otherProxies = allProxies.filter((proxy) => proxy && proxy.name && !otherRegex.test(proxy.name));
  const hasOtherNodes = otherProxies.length > 0;
  if (hasOtherNodes) regionAndOther.push("其他节点");

  const pick = (items) => {
    const validGroupNames = new Set([
      "节点选择",
      "自动选择",
      "手动切换",
      "DIRECT",
      ...regionAndOther
    ]);
    return [...new Set(items)].filter((item) => validGroupNames.has(item));
  };

  const policyProxyOptions = pick(["自动选择", ...regionAndOther, "手动切换", "DIRECT"]);
  const proxyFirstOptions = pick(["节点选择", "自动选择", ...regionAndOther, "手动切换", "DIRECT"]);
  const directFirstOptions = pick(["DIRECT", "节点选择", "自动选择", ...regionAndOther, "手动切换"]);
  const usFirstOptions = pick(["美国节点Pro", "美国节点", "节点选择", "自动选择", "狮城节点Pro", "狮城节点", "香港节点Pro", "香港节点", "台湾节点Pro", "台湾节点", "日本节点Pro", "日本节点", "韩国节点Pro", "韩国节点", "其他节点", "手动切换", "DIRECT"]);
  const gameOptions = pick(["节点选择", "自动选择", "DIRECT", ...regionAndOther, "手动切换"]);

  const proxyGroups = [
    {
      name: "GLOBAL",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
      "include-all": true,
      type: "select",
      proxies: pick(["节点选择", "自动选择", "手动切换", ...regionAndOther])
    },
    {
      name: "节点选择",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
      type: "select",
      proxies: policyProxyOptions
    },
    {
      name: "自动选择",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png",
      type: "url-test",
      "include-all": true,
      interval: 300,
      tolerance: 50
    },
    {
      name: "手动切换",
      icon: "https://testingcf.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
      "include-all": true,
      type: "select"
    },
    {
      name: "谷歌服务",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
      type: "select",
      proxies: usFirstOptions
    },
    {
      name: "AI节点",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bot.png",
      type: "select",
      proxies: usFirstOptions
    },
    {
      name: "油管视频",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
      type: "select",
      proxies: usFirstOptions
    },
    {
      name: "游戏平台",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Game.png",
      type: "select",
      proxies: gameOptions
    },
    {
      name: "奈飞视频",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
      type: "select",
      proxies: proxyFirstOptions
    },
    {
      name: "国外媒体",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png",
      type: "select",
      proxies: proxyFirstOptions
    },
    {
      name: "国内媒体",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/DomesticMedia.png",
      type: "select",
      proxies: directFirstOptions
    },
    {
      name: "谷歌FCM",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
      type: "select",
      proxies: directFirstOptions
    },
    {
      name: "苹果服务",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png",
      type: "select",
      proxies: directFirstOptions
    },
    {
      name: "全球直连",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
      type: "select",
      proxies: ["DIRECT", "节点选择", "自动选择"]
    },
    {
      name: "漏网之鱼",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Final.png",
      type: "select",
      proxies: proxyFirstOptions
    }
  ];

  for (const [regionName, regionConfig] of Object.entries(regionFilters)) {
    if (availableRegions.includes(regionName)) {
      proxyGroups.push({
        name: regionName,
        icon: regionConfig.icon,
        "include-all": true,
        filter: regionConfig.filter,
        type: "url-test",
        interval: 300,
        tolerance: 50
      });
    }

    const proGroupName = toProGroupName(regionName);
    if (availableProRegions.includes(proGroupName)) {
      proxyGroups.push({
        name: proGroupName,
        icon: regionConfig.icon,
        "include-all": true,
        filter: toProRegionFilter(regionConfig.filter),
        type: "url-test",
        interval: 300,
        tolerance: 50
      });
    }
  }

  if (hasOtherNodes) {
    proxyGroups.push({
      name: "其他节点",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
      "include-all": true,
      "exclude-filter": `(?i)${excludePatternBody}`,
      type: "url-test",
      interval: 300,
      tolerance: 50
    });
  }

  config["proxy-groups"] = proxyGroups;

  config["rule-providers"] = {
    LocalAreaNetwork: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/LocalAreaNetwork.list",
      path: "./ruleset/LocalAreaNetwork.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    UnBan: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/UnBan.list",
      path: "./ruleset/UnBan.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    GoogleServer: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Google.list",
      path: "./ruleset/Google.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    GoogleFCM: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/GoogleFCM.list",
      path: "./ruleset/GoogleFCM.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    GoogleCN: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/GoogleCN.list",
      path: "./ruleset/GoogleCN.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    SteamCN: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/SteamCN.list",
      path: "./ruleset/SteamCN.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Bing: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Bing.list",
      path: "./ruleset/Bing.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    OneDrive: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/OneDrive.list",
      path: "./ruleset/OneDrive.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Microsoft: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Microsoft.list",
      path: "./ruleset/Microsoft.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Apple: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Apple.list",
      path: "./ruleset/Apple.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Telegram: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Telegram.list",
      path: "./ruleset/Telegram.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    "AI平台-国外": {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/AI.list",
      path: "./ruleset/AI.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    NetEaseMusic: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/NetEaseMusic.list",
      path: "./ruleset/NetEaseMusic.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Epic: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Epic.list",
      path: "./ruleset/Epic.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Origin: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Origin.list",
      path: "./ruleset/Origin.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Sony: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Sony.list",
      path: "./ruleset/Sony.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Steam: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Steam.list",
      path: "./ruleset/Steam.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Nintendo: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Nintendo.list",
      path: "./ruleset/Nintendo.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    YouTube: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/YouTube.list",
      path: "./ruleset/YouTube.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Netflix: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Netflix.list",
      path: "./ruleset/Netflix.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Bahamut: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Bahamut.list",
      path: "./ruleset/Bahamut.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    ChinaMedia: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ChinaMedia.list",
      path: "./ruleset/ChinaMedia.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    ProxyMedia: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyMedia.list",
      path: "./ruleset/ProxyMedia.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    ProxyGFWlist: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyGFWlist.list",
      path: "./ruleset/ProxyGFWlist.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    },
    ChinaDomain: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ChinaDomain.list",
      path: "./ruleset/ChinaDomain.list",
      behavior: "domain",
      interval: 86400,
      format: "text",
      type: "http"
    },
    ChinaCompanyIp: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ChinaCompanyIp.list",
      path: "./ruleset/ChinaCompanyIp.list",
      behavior: "ipcidr",
      interval: 86400,
      format: "text",
      type: "http"
    },
    Download: {
      url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Download.list",
      path: "./ruleset/Download.list",
      behavior: "classical",
      interval: 86400,
      format: "text",
      type: "http"
    }
  };
  config["rules"] = [
    "RULE-SET,LocalAreaNetwork,全球直连",
    "RULE-SET,UnBan,全球直连",
    "RULE-SET,GoogleServer,谷歌服务",
    "RULE-SET,GoogleFCM,谷歌FCM",
    "RULE-SET,GoogleCN,全球直连",
    "RULE-SET,SteamCN,全球直连",
    "RULE-SET,Bing,全球直连",
    "RULE-SET,OneDrive,全球直连",
    "RULE-SET,Microsoft,全球直连",
    "RULE-SET,Apple,苹果服务",
    "RULE-SET,AI平台-国外,AI节点",
    "RULE-SET,Epic,游戏平台",
    "RULE-SET,Origin,游戏平台",
    "RULE-SET,Sony,游戏平台",
    "RULE-SET,Steam,游戏平台",
    "RULE-SET,Nintendo,游戏平台",
    "RULE-SET,YouTube,油管视频",
    "RULE-SET,Netflix,奈飞视频",
    "RULE-SET,ChinaMedia,国内媒体",
    "RULE-SET,ProxyMedia,国外媒体",
    "RULE-SET,Telegram,节点选择",
    "RULE-SET,ProxyGFWlist,节点选择",
    "RULE-SET,ChinaDomain,全球直连",
    "RULE-SET,ChinaCompanyIp,全球直连",
    "RULE-SET,Download,全球直连",
    "GEOIP,CN,全球直连",
    "MATCH,漏网之鱼"
  ];
  return config;
}
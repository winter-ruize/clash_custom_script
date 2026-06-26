function main(config) {
  // 获取所有代理节点
  const allProxies = config.proxies || [];

  // Clash Verge 的代理页可能不会按 proxy-groups 数组顺序渲染，给策略组加固定序号前缀用于稳定排序。
  const GROUP = {
    NODE: "01 节点选择",
    AUTO: "02 自动选择",
    MANUAL: "03 手动切换",
    GOOGLE: "04 谷歌服务",
    AI: "05 AI节点",
    YOUTUBE: "06 油管视频",
    GAME: "07 游戏平台",
    NETFLIX: "08 奈飞视频",
    FOREIGN_MEDIA: "09 国外媒体",
    DOMESTIC_MEDIA: "10 国内媒体",
    GOOGLE_FCM: "11 谷歌FCM",
    APPLE: "12 苹果服务",
    DIRECT: "13 全球直连",
    FINAL: "14 漏网之鱼"
  };

  // 地区过滤规则：会根据订阅内实际节点动态生成地区组，避免空分组。
  const regionFilters = {
    "21 美国节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png",
      filter: "(?i)美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States"
    },
    "22 香港节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png",
      filter: "(?i)港|HK|hk|Hong Kong|HongKong|hongkong"
    },
    "23 台湾节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png",
      filter: "(?i)台|新北|彰化|TW|Taiwan"
    },
    "24 狮城节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png",
      filter: "(?i)新加坡|坡|狮城|SG|Singapore"
    },
    "25 日本节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png",
      filter: "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan"
    },
    "26 韩国节点": {
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png",
      filter: "(?i)KR|Korea|KOR|首尔|韩|韓"
    }
  };

  const stripInlineIgnoreCase = (pattern) => pattern.replace(/\(\?i\)/g, "");
  const toJsRegex = (pattern) => new RegExp(stripInlineIgnoreCase(pattern), "i");
  const proRegex = /Pro/i;
  const toProGroupName = (regionName) => `${regionName}Pro`;
  const isNamedProxy = (proxy) => proxy && proxy.name;
  const toProxyNames = (proxies) => proxies.filter(isNamedProxy).map((proxy) => proxy.name);
  const isProNode = (proxy) => isNamedProxy(proxy) && proRegex.test(proxy.name);

  const allProxyNames = toProxyNames(allProxies);
  const availableRegions = [];
  const availableProRegions = [];
  const regionAndOther = [];
  const regionProxyNames = {};
  const proRegionProxyNames = {};

  for (const [regionName, regionConfig] of Object.entries(regionFilters)) {
    const regex = toJsRegex(regionConfig.filter);
    const matchedProxies = allProxies.filter((proxy) => isNamedProxy(proxy) && regex.test(proxy.name));
    const proProxies = matchedProxies.filter((proxy) => isProNode(proxy));

    if (matchedProxies.length > 0) {
      availableRegions.push(regionName);
      regionAndOther.push(regionName);
      regionProxyNames[regionName] = toProxyNames(matchedProxies);
    }
    if (proProxies.length > 0) {
      const proGroupName = toProGroupName(regionName);
      availableProRegions.push(proGroupName);
      regionAndOther.push(proGroupName);
      proRegionProxyNames[proGroupName] = toProxyNames(proProxies);
    }
  }

  const excludePatternBody = Object.values(regionFilters)
    .map((regionConfig) => stripInlineIgnoreCase(regionConfig.filter))
    .join("|");
  const otherRegex = new RegExp(excludePatternBody, "i");
  const otherProxies = allProxies.filter((proxy) => isNamedProxy(proxy) && !otherRegex.test(proxy.name));
  const otherProxyNames = toProxyNames(otherProxies);
  const hasOtherNodes = otherProxyNames.length > 0;
  if (hasOtherNodes) regionAndOther.push("27 其他节点");

  const pick = (items) => {
    const validGroupNames = new Set([
      GROUP.NODE,
      GROUP.AUTO,
      GROUP.MANUAL,
      "DIRECT",
      ...regionAndOther
    ]);
    return [...new Set(items)].filter((item) => validGroupNames.has(item));
  };

  const policyProxyOptions = pick([GROUP.AUTO, ...regionAndOther, GROUP.MANUAL, "DIRECT"]);
  const proxyFirstOptions = pick([GROUP.NODE, GROUP.AUTO, ...regionAndOther, GROUP.MANUAL, "DIRECT"]);
  const directFirstOptions = pick(["DIRECT", GROUP.NODE, GROUP.AUTO, ...regionAndOther, GROUP.MANUAL]);
  const usFirstOptions = pick(["21 美国节点Pro", "21 美国节点", GROUP.NODE, GROUP.AUTO, "24 狮城节点Pro", "24 狮城节点", "22 香港节点Pro", "22 香港节点", "23 台湾节点Pro", "23 台湾节点", "25 日本节点Pro", "25 日本节点", "26 韩国节点Pro", "26 韩国节点", "27 其他节点", GROUP.MANUAL, "DIRECT"]);
  const gameOptions = pick([GROUP.NODE, GROUP.AUTO, "DIRECT", ...regionAndOther, GROUP.MANUAL]);

  const proxyGroups = [
    {
      name: "GLOBAL",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
      type: "select",
      proxies: pick([GROUP.NODE, GROUP.AUTO, GROUP.MANUAL, ...regionAndOther])
    },
    {
      name: GROUP.NODE,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
      type: "select",
      proxies: policyProxyOptions
    },
    {
      name: GROUP.AUTO,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png",
      type: "url-test",
      proxies: allProxyNames,
      interval: 300,
      tolerance: 50
    },
    {
      name: GROUP.MANUAL,
      icon: "https://testingcf.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
      type: "select",
      proxies: allProxyNames
    },
    {
      name: GROUP.GOOGLE,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
      type: "select",
      proxies: usFirstOptions
    },
    {
      name: GROUP.AI,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bot.png",
      type: "select",
      proxies: usFirstOptions
    },
    {
      name: GROUP.YOUTUBE,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
      type: "select",
      proxies: usFirstOptions
    },
    {
      name: GROUP.GAME,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Game.png",
      type: "select",
      proxies: gameOptions
    },
    {
      name: GROUP.NETFLIX,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
      type: "select",
      proxies: proxyFirstOptions
    },
    {
      name: GROUP.FOREIGN_MEDIA,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png",
      type: "select",
      proxies: proxyFirstOptions
    },
    {
      name: GROUP.DOMESTIC_MEDIA,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/DomesticMedia.png",
      type: "select",
      proxies: directFirstOptions
    },
    {
      name: GROUP.GOOGLE_FCM,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google_Search.png",
      type: "select",
      proxies: directFirstOptions
    },
    {
      name: GROUP.APPLE,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png",
      type: "select",
      proxies: directFirstOptions
    },
    {
      name: GROUP.DIRECT,
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
      type: "select",
      proxies: ["DIRECT", GROUP.NODE, GROUP.AUTO]
    },
    {
      name: GROUP.FINAL,
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
        type: "url-test",
        proxies: regionProxyNames[regionName],
        interval: 300,
        tolerance: 50
      });
    }

    const proGroupName = toProGroupName(regionName);
    if (availableProRegions.includes(proGroupName)) {
      proxyGroups.push({
        name: proGroupName,
        icon: regionConfig.icon,
        type: "url-test",
        proxies: proRegionProxyNames[proGroupName],
        interval: 300,
        tolerance: 50
      });
    }
  }

  if (hasOtherNodes) {
    proxyGroups.push({
      name: "27 其他节点",
      icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
      type: "url-test",
      proxies: otherProxyNames,
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
    `${"RULE-SET,LocalAreaNetwork,"}${GROUP.DIRECT}`,
    `${"RULE-SET,UnBan,"}${GROUP.DIRECT}`,
    `${"RULE-SET,GoogleServer,"}${GROUP.GOOGLE}`,
    `${"RULE-SET,GoogleFCM,"}${GROUP.GOOGLE_FCM}`,
    `${"RULE-SET,GoogleCN,"}${GROUP.DIRECT}`,
    `${"RULE-SET,SteamCN,"}${GROUP.DIRECT}`,
    `${"RULE-SET,Bing,"}${GROUP.DIRECT}`,
    `${"RULE-SET,OneDrive,"}${GROUP.DIRECT}`,
    `${"RULE-SET,Microsoft,"}${GROUP.DIRECT}`,
    `${"RULE-SET,Apple,"}${GROUP.APPLE}`,
    `${"RULE-SET,AI平台-国外,"}${GROUP.AI}`,
    `${"RULE-SET,Epic,"}${GROUP.GAME}`,
    `${"RULE-SET,Origin,"}${GROUP.GAME}`,
    `${"RULE-SET,Sony,"}${GROUP.GAME}`,
    `${"RULE-SET,Steam,"}${GROUP.GAME}`,
    `${"RULE-SET,Nintendo,"}${GROUP.GAME}`,
    `${"RULE-SET,YouTube,"}${GROUP.YOUTUBE}`,
    `${"RULE-SET,Netflix,"}${GROUP.NETFLIX}`,
    `${"RULE-SET,ChinaMedia,"}${GROUP.DOMESTIC_MEDIA}`,
    `${"RULE-SET,ProxyMedia,"}${GROUP.FOREIGN_MEDIA}`,
    `${"RULE-SET,Telegram,"}${GROUP.NODE}`,
    `${"RULE-SET,ProxyGFWlist,"}${GROUP.NODE}`,
    `${"RULE-SET,ChinaDomain,"}${GROUP.DIRECT}`,
    `${"RULE-SET,ChinaCompanyIp,"}${GROUP.DIRECT}`,
    `${"RULE-SET,Download,"}${GROUP.DIRECT}`,
    `${"GEOIP,CN,"}${GROUP.DIRECT}`,
    `${"MATCH,"}${GROUP.FINAL}`
  ];
  return config;
}

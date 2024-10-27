export var ServerConfig = {
  version: '1.0.2',
  // root_url: `http://localhost:8061`,
  root_url: `https://www.mimgame.com/v1/mergecar3d`,
  cdn_url: `https://www.mimgame.com/games/mergecar3d`,
  ip_api: `https://pv.sohu.com/cityjson?ie=utf-8`,
  ip_query:
    'https://apis.juhe.cn/ip/ipNew?key=047ffdc934b3229f78059746143bede0&ip=',
  config_url: `config.json`,
  is_local_game: true,
  userId: 'oJMUQ5UEbNZfX766T7tzeoRwBNBI',
  is_login_enabled: false,
};
if (CC_DEBUG) {
  ServerConfig.is_local_game = true;
}
ServerConfig.cdn_url = `${ServerConfig.cdn_url}/${ServerConfig.version}/`;
ServerConfig.config_url = ServerConfig.cdn_url + ServerConfig.config_url;
// tmxLoader.baseUrl = ServerConfig.cdn_url + "cloud-levels/"

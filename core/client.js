
const axois = require('axios')
const url = require('url');

class InstagramClient {

    constructor(user, options = { httpClient: {} }) {
      this.baseURL = 'https://www.instagram.com';
      this.setUser(user);
      this.httpClientInit(options.httpClient);
    }

    setUser(user) {
      if (user && user.username && user.password) {
        this.user = user;        
      } else {
        throw new Error('User is invalid')
      }
    }

    httpClientInit({ csrftoken }) {
      this.instance = axois.create({
        baseURL: this.baseURL,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
          'Accept-Language': 'en-US',
          'X-Instagram-AJAX': 1,
          // 'X-CSRFToken': csrftoken || null ,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': this.baseURL
        },
        withCredentials: true
      });
    }

    async loginCSRF() {
      const res = await this.instance.get('/', { responseType: 'text' });
      const pattern = new RegExp(/(csrf_token":")\w+/)
      const matches = res.data.match(pattern)
      const LOGIN_CSRF_TOKEN = matches[0].substring(13);
      this.instance.defaults.headers.common['X-CSRFToken'] = LOGIN_CSRF_TOKEN;
    }

    createEncPassword(password) {
      return `#PWD_INSTAGRAM_BROWSER:0:${Date.now()}:${password}`
    }

    parseCookie(res) {
      return res.headers['set-cookie'].reduce((acc, curr) => {
        curr.split(';').map((e) => {
          const [ key, value ] = e.split('=');
          acc[key.trim()] = value;
        })
        return acc;
      }, {})
    }

    async login() {
      await this.loginCSRF();
      const params = new url.URLSearchParams({ 
        username: this.user.username, 
        enc_password: this.createEncPassword(this.user.password) 
      });
      const res = await this.instance.post(
        '/accounts/login/ajax/', 
        params.toString(),
        {
          withCredentials: true
        }
      );
      const cookie = this.parseCookie(res);
      // TODO: we can store cookie on some storage and use it in future 
      this.instance.defaults.headers.common['X-CSRFToken'] = cookie.csrftoken;
      this.instance.defaults.headers.common['cookie'] = String.raw`csrftoken=${cookie.csrftoken}; mid=${cookie.mid}; ds_user_id=${cookie.ds_user_id}; sessionid=${cookie.sessionid}; ig_did=${cookie.ig_did};`; 
    }

    async getProfile() {
      const response = await this.instance.get('/accounts/edit/?__a=1', { 
        responseType: 'json', 
        withCredentials: true 
      })
      console.table(response.data);
      console.log(response.status);
      console.log(response.statusText);
    }

}

module.exports = InstagramClient;
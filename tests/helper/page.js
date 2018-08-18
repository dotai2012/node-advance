const puppeteer = require('puppeteer');
const sessionFactory = require('../factory/session');
const userFactory = require('../factory/user');

class Page {
  constructor(page) {
    this.page = page;
  }

  static async build() {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const customPage = new Page(page);
    return new Proxy(customPage, {
      get(target, prop) {
        return browser[prop] || target[prop] || page[prop];
      },
    });
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });
    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}
module.exports = Page;

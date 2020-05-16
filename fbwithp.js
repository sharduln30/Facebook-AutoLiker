let fs = require("fs");
let puppeteer = require('puppeteer');

let cfile = process.argv[2];
let pageToLike = process.argv[3];
let numPosts = parseInt(process.argv[4]);

(async function () {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        slowMo: 20,
        args: ['--start-maximized', '--disable-notifications', '--incognito']
    });

    let contents = await fs.promises.readFile(cfile, 'utf-8');
    let obj = JSON.parse(contents);
    let user = obj.user;
    let pwd = obj.pwd;

    let pages = await browser.pages();
    let page = pages[0];
    page.goto('https://www.facebook.com', {
        waitUntil: 'networkidle2'
    });
    await page.waitForSelector('#email', {
        visible: true
    });

    await page.type('#email', user);
    await page.type('#pass', pwd);
    await page.click("#loginbutton");
    await page.waitForSelector('[data-testid=search_input]', {
        visible: true
    });


    await page.type('[data-testid=search_input]', pageToLike);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForSelector('div._6v_0._4ik4._4ik5 a', {
        visible: true
    });

    await page.click('div._6v_0._4ik4._4ik5 a');
    await page.waitForSelector('[data-key=tab_posts]', {
        visible: true
    });

    await page.click('[data-key=tab_posts]');

    // try to find the reason here.
    await page.waitForSelector('#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8'); 
    // jugaad -> this is not how it should be but i have no time for doing the best thing
    // the one who maintains this after me should make better
    let idx = 0;

    do {
        let elements = await page.$$('#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8');
        console.log(elements.length + elements[0]);
        await serveElement(elements[idx]);
        idx++;
        await page.waitForSelector('.uiMorePagerLoader', {
            hidden: true
        });
    } while (idx < numPosts);
    //   browser.close();
})();

async function serveElement(el) {
    let toClick = await el.$('._666k');
    await toClick.click();
}

import asyncio, pathlib
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto('file://'+str(pathlib.Path('SRS.html').resolve())); await pg.wait_for_timeout(800)
        await pg.pdf(path='../SRS.pdf', format='A4', print_background=True, display_header_footer=True,
          header_template='<div></div>',
          footer_template='<div style="font-size:8px;width:100%;text-align:center;color:#4B6478;font-family:Arial">SRS – Restaurant App MVP · Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
          margin={'top':'16mm','bottom':'16mm','left':'15mm','right':'15mm'})
        await b.close()
asyncio.run(main())

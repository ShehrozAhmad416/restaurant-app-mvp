import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(device_scale_factor=2)
        for n in ['01_use_case','05_component']:
            svg=open(n+'.svg').read()
            await pg.set_content(f'<html><body style="margin:0;background:white">{svg}</body></html>')
            await pg.locator('svg').first.screenshot(path=f'../{n}.png')
        await b.close()
asyncio.run(main())

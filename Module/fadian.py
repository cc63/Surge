# 小作文生成，就算访问不了后端也可以使用。
# 适度发电促进感情，过度发电鱼塘爆炸
# 请注意不要刷屏

from secrets import choice

from pagermaid import log, Config
from pagermaid.listener import listener
from pagermaid.enums import Message
from pagermaid.services import client as request, scheduler
from pagermaid.hook import Hook


class FaDian:
    def __init__(self):
        self.data = {
            "data": [
                "久未放晴的天空☁️\n依旧留着{name}的笑容😊\n哭过😭\n却无法掩埋歉疚⛈️"
                "我拉着线🪁\n复习{name}给的温柔😭"
            ],
            "date": 0
        }
        self.api = f"{Config.GIT_SOURCE}fadian/fadian.json"

    async def fetch(self):
        try:
            req = await request.get(self.api, follow_redirects=True)
            assert req.status_code == 200
            self.data = req.json()
        except Exception as e:
            await log(f"Warning: plugin fadian failed to refresh data. {e}")


fa_dian = FaDian()


@Hook.on_startup()
async def init_data():
    await fa_dian.fetch()


@scheduler.scheduled_job("cron", hour="2", id="plugins.fa_dian.refresh")
async def fa_dian_refresher_data():
    await fa_dian.fetch()


@listener(command="fadian",
          description="快速对着指定人物发电",
          parameters="<query>")
async def fa_dian_process(message: Message):
    if not (query := message.arguments):
        return await message.edit("请指定发电对象")
    if data := fa_dian.data.get("data"):
        return await message.edit(choice(data).format(name=query))
    else:
        return await message.edit("发电数据为空")

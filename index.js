const express = require('express')
const server = express()

const port = process.env.PORT || 8000;
server.get('/', (req, res) => {
  res.send('Server running...')
})
server.listen(port, () => {
  // console.clear()
  console.log('\nWeb-server running!\n')
})

// LOAD Baileys
const {
  WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange,
  MessageOptions,
  WALocationMessage,
  WA_MESSAGE_STUB_TYPES,
  ReconnectMode,
  ProxyAgent,
  waChatKey,
  mentionedJid,
  processTime,
} = require('@adiwajshing/baileys')

// LOAD ADDITIONAL NPM PACKAGES
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const WSF = require('wa-sticker-formatter')
const YTDL = require("ytdl-core")
const axios = require('axios')
const puppeteer = require("puppeteer")
const http = require('https') // or 'https' for https:// URLs
const request = require('request')
const cheerio = require('cheerio')
const log = console.debug
const exec = require("child_process").exec
const qr = require('qr-image')

// LOAD SOURCES
const pesan = require('./src/pesan')

// BASIC SETTINGS
prefix = '/';

// LOAD CUSTOM FUNCTIONS
const getGroupAdmins = (participants) => {
  admins = []
  for (let i of participants) {
    i.isAdmin ? admins.push(i.jid) : ''
  }
  return admins
}
const helpBiasa = (prefix) => {
  return `
🎀 *Bahagia-Bot* 🎀\n
\n
🔥 *${prefix}sticker* - _Membuat Sticker dari foto/video_\n
🔥 *${prefix}ytmp3* - _Download lagu dari YouTube_\n
🔥 *${prefix}ytmp4* - _Download video dari YouTube_\n
🔥 *${prefix}yts* - _Download lagu dari YouTube(HD Audio)_\n
🔥 *${prefix}yt* - _Download video dari YouTube(HD Video)_\n
🔥 *${prefix}twd* - _Twitter Video Downloader_\n
🔥 *${prefix}ocr* - _Mengubah gambar menjadi teks_\n
🔥 *${prefix}carbon* - _Mengubah teks menjadi gambar keren_\n
🔥 *${prefix}qr* - _Membuat QR kode dari text tertentu_\n
\n
🛡 _Semua data yang kamu kirim, nggak kami simpen kok, dijamin aman deh_`
}
const adminHelp = (prefix, groupName) => {
  return `
  🎀 *RiyanBot* 🎀

*${prefix}add <phone number>*
    _Add any new member!_

*${prefix}kick <@mention>*
    _Kick any member out from group!_
    _Alias with ${prefix}remove, ${prefix}ban_

*${prefix}promote <@mention>*
    _Give admin permission to a member!_

*${prefix}demote <@mention>*
    _Remove admin permission of a member!_

*${prefix}rename <new-subject>*
    _Change group subject!_

*${prefix}chat <on/off>*
    _Enable/disable group chat_
    _/chat on - for everyone!_
    _/chat off - for admin only!_

*${prefix}link*
    _Get group invite link!_
    _Alias with ${prefix}getlink, ${prefix}grouplink_

*${prefix}sticker*
    _Create a sticker from different media types!_
    *Properties of sticker:*
        _crop_ - Used to crop the sticker size!
        _author_ - Add metadata in sticker!
        _pack_ - Add metadata in sticker!
        _nometadata_ - Remove all metadata from sticker!
    *Examples:*
        _${prefix}sticker pack simple-k-bot author Karma_
        _${prefix}sticker crop_
        _${prefix}sticker nometadata_

*${prefix}removebot*
    _Remove bot from group!_`
}
const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 1000000)}${ext}`
}
const randomString = (length) => {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyzsadw'
  let str = '';
  lengt = length || 9
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * 65)];
  }
  return str
}
const shortlink = async (url) => {
  const getdt = await axios.get(`https://tinyurl.com/api-create.php?url=${url}`)
  return getdt.data
}
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
const getBuffer = async (url, opts) => {
  try {
    const reqdata = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
      },
      ...opts,
      responseType: 'arraybuffer'
    });
    return reqdata.data
  } catch (e) {
    throw e
  }
}

// MAIN FUNCTION
async function main() {

  const conn = new WAConnection()
  conn.logger.level = 'warn'
  const dotenv = require('dotenv')
  dotenv.config()
  const {
    SESSION_WA,
    URL
  } = process.env
  const sessionData = JSON.parse(SESSION_WA)
  conn.loadAuthInfo(sessionData)
  conn.on('connecting', () => {
    console.log('Connecting...')
  })
  conn.on('open', () => {
    // console.clear()
    console.log('Connected!')
  })
  await conn.connect({
    timeoutMs: 30 * 1000
  })

  conn.on('group-participants-update', async (anu) => {
    try {
      const mdata = await conn.groupMetadata(anu.jid)
      console.log(anu)
      if (anu.action == 'add') {
        num = anu.participants[0]
        num_split = `${num.split('@s.whatsapp.net')[0]}`
        console.log('Joined: ', num)
      }
    } catch (e) {
      console.log(e)
    }
  })

  conn.on('chat-update', async (mek) => {
    try {
      if (!mek.hasNewMessage) return
      mek = JSON.parse(JSON.stringify(mek)).messages[0]
      if (!mek.message) return
      if (mek.key && mek.key.remoteJid == 'status@broadcast') return
      if (mek.key.fromMe) return
      const content = JSON.stringify(mek.message)
      global.prefix
      const from = mek.key.remoteJid
      const type = Object.keys(mek.message)[0]
      const {
        text,
        extendedText,
        contact,
        location,
        liveLocation,
        image,
        video,
        sticker,
        document,
        audio,
        product
      } = MessageType
      body = (type === 'conversation' && mek.message.conversation.startsWith(prefix)) ? mek.message.conversation : (type == 'imageMessage') && mek.message.imageMessage.caption.startsWith(prefix) ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption.startsWith(prefix) ? mek.message.videoMessage.caption : (type == 'extendedTextMessage') && mek.message.extendedTextMessage.text.startsWith(prefix) ? mek.message.extendedTextMessage.text : ''
      const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
      const args = body.trim().split(/ +/).slice(1)
      const isCmd = body.startsWith(prefix)

      const botNumber = conn.user.jid
      const isGroup = from.endsWith('@g.us')
      const sender = isGroup ? mek.participant : mek.key.remoteJid
      const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const groupMembers = isGroup ? groupMetadata.participants : ''
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
      const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
      const isGroupAdmins = groupAdmins.includes(sender) || false

      const reply = (teks) => {
        conn.sendMessage(from, teks, text, {
          quoted: mek
        })
      }

      const costum = (pesan, tipe, target, target2) => {
        conn.sendMessage(from, pesan, tipe, {
          quoted: {
            key: {
              fromMe: false,
              participant: `${target}`,
              ...(from ? {
                remoteJid: from
              } : {})
            },
            message: {
              conversation: `${target2}`
            }
          }
        })
      }

      const isMedia = (type === 'imageMessage' || type === 'videoMessage')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')
      if (isCmd && isGroup) {
        console.log('[COMMAND]', command, '[FROM]', sender.split('@')[0], '[IN]', groupName)
      } else if (isCmd) {
        console.log('[COMMAND]', command, '[FROM]', sender.split('@')[0])
      }

      /////////////// COMMANDS \\\\\\\\\\\\\\\

      switch (command) {

        /////////////// GROUP COMMAND \\\\\\\\\\\\\\\

        case 'help':
        case 'acmd':
          if (!isGroup) {
            await reply(helpBiasa(prefix))
            return
          }
          await costum(adminHelp(prefix, groupName), text);
          break

        case 'link':
        case 'getlink':
        case 'grouplink':
          if (!isGroup) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          gc_invite_code = await conn.groupInviteCode(from)
          gc_link = `https://chat.whatsapp.com/${gc_invite_code}`
          conn.sendMessage(from, gc_link, text, {
            quoted: mek,
            detectLinks: true
          })
          break;

          /////////////// ADMIN COMMANDS \\\\\\\\\\\\\\\

        case 'add':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          if (args.length < 1) return;
          var num = '';
          if (args.length > 1) {
            for (let j = 0; j < args.length; j++) {
              num = num + args[j]
            }
            num = `${num.replace(/ /g, '')}@s.whatsapp.net`
          } else {
            num = `${args[0].replace(/ /g, '')}@s.whatsapp.net`
          }
          if (num.startsWith('+')) {
            num = `${num.split('+')[1]}`
          }
          const response = await conn.groupAdd(from, [num])
          get_status = `${num.split('@s.whatsapp.net')[0]}`
          get_status = response[`${get_status}@c.us`];
          if (get_status == 400) {
            reply('_❌ ERROR: Invalid number! ❌_');
          }
          if (get_status == 403) {
            reply('_❌ ERROR: Number has privacy on adding group! ❌_');
          }
          if (get_status == 408) {
            reply('_❌ ERROR: Number has left the group recently! ❌_');
          }
          if (get_status == 409) {
            reply('_❌ ERROR: Number is already exists! ❌_');
          }
          if (get_status == 500) {
            reply('_❌ ERROR: Group is currently full! ❌_');
          }
          if (get_status == 200) {
            reply('_✔ SUCCESS: Number added to group! ✔_');
          }
          break;

        case 'kick':
        case 'remove':
        case 'ban':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return;
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (groupAdmins.includes(`${mentioned}`) == true) return;
          if (mentioned.length > 1) {
            return;
          } else {
            conn.groupRemove(from, mentioned)
          }
          break;

        case 'promote':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return;
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (groupAdmins.includes(`${mentioned}`) == true) return;
          if (mentioned.length > 1) {
            return;
          } else {
            conn.groupMakeAdmin(from, mentioned)
          }
          break;

        case 'demote':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          if (mek.message.extendedTextMessage === undefined || mek.message.extendedTextMessage === null) return reply('_⚠ USAGE: /demote <@mention> ⚠_');
          mentioned = mek.message.extendedTextMessage.contextInfo.mentionedJid
          if (groupAdmins.includes(`${mentioned}`) == false) return;
          if (mentioned.length > 1) {
            return;
          } else {
            conn.groupDemoteAdmin(from, mentioned)
          }
          break;

        case 'chat':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          if (args.length < 1) return;
          if (args[0] == 'on') {
            conn.groupSettingChange(from, GroupSettingChange.messageSend, false);
          } else if (args[0] == 'off') {
            conn.groupSettingChange(from, GroupSettingChange.messageSend, true);
          } else {
            return;
          }
          break;

        case 'rename':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          if (!isBotGroupAdmins) return reply(pesan.admin_error);
          if (args.length < 1) return;
          get_subject = '';
          for (i = 0; i < args.length; i++) {
            get_subject = get_subject + args[i] + ' ';
          }
          conn.groupUpdateSubject(from, get_subject);
          break;

        case 'removebot':
          if (!isGroup) return;
          if (!isGroupAdmins) return;
          conn.groupLeave(from)
          break;

          /////////////// USERS COMMANDS \\\\\\\\\\\\\\\

        case 'sticker':

          // Format should be <prefix>sticker pack <pack_name> author <author_name>
          var packName = ""
          var authorName = ""

          // Check if pack keyword is found in args!
          if (args.includes('pack') == true) {
            packNameDataCollection = false;
            for (let i = 0; i < args.length; i++) {
              // Enables data collection when keyword found in index!
              if (args[i].includes('pack') == true) {
                packNameDataCollection = true;
              }
              if (args[i].includes('author') == true) {
                packNameDataCollection = false;
              }
              // If data collection is enabled and args length is more then one it will start appending!
              if (packNameDataCollection == true) {
                packName = packName + args[i] + ' '
              }
            }
            // Check if variable contain unnecessary startup word!
            if (packName.startsWith('pack ')) {
              packName = `${packName.split('pack ')[1]}`
            }
          }

          // Check if author keyword is found in args!
          if (args.includes('author') == true) {
            authorNameDataCollection = false;
            for (let i = 0; i < args.length; i++) {
              // Enables data collection when keyword found in index!
              if (args[i].includes('author') == true) {
                authorNameDataCollection = true;
              }
              // If data collection is enabled and args length is more then one it will start appending!
              if (authorNameDataCollection == true) {
                authorName = authorName + args[i] + ' '
              }
              // Check if variable contain unnecessary startup word!
              if (authorName.startsWith('author ')) {
                authorName = `${authorName.split('author ')[1]}`
              }
            }
          }

          // Check if packName and authorName is empty it will pass default values!
          if (packName == "") {
            packName = "bahagia-bot"
          }
          if (authorName == "") {
            authorName = "riyanris"
          }

          outputOptions = [`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`];
          if (args.includes('crop') == true) {
            outputOptions = [
              `-vcodec`,
              `libwebp`,
              `-vf`,
              `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=15`,
              `-loop`,
              `0`,
              `-ss`,
              `00:00:00.0`,
              `-t`,
              `00:00:10.0`,
              `-preset`,
              `default`,
              `-an`,
              `-vsync`,
              `0`,
              `-s`,
              `512:512`
            ];
          }

          if ((isMedia && !mek.message.videoMessage || isQuotedImage)) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            const media = await conn.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            reply('⌛ Processing image... ⏳')
            await ffmpeg(`./${media}`)
              .input(media)
              .on('error', function (err) {
                fs.unlinkSync(media)
                console.log(`Error : ${err}`)
                reply('_❌ ERROR: Failed to convert image into sticker! ❌_')
              })
              .on('end', function () {
                buildSticker()
              })
              .addOutputOptions(outputOptions)
              .toFormat('webp')
              .save(ran)

            async function buildSticker() {
              if (args.includes('nometadata') == true) {
                conn.sendMessage(from, fs.readFileSync(ran), sticker, {
                  quoted: mek
                })
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              } else {
                const webpWithMetadata = await WSF.setMetadata(packName, authorName, ran)
                conn.sendMessage(from, webpWithMetadata, MessageType.sticker)
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              }
            }

          } else if ((isMedia && mek.message.videoMessage.seconds < 11 || isQuotedVideo && mek.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11)) {
            const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek
            const media = await conn.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            reply('⌛ Processing animation... ⏳')
            await ffmpeg(`./${media}`)
              .inputFormat(media.split('.')[1])
              .on('error', function (err) {
                fs.unlinkSync(media)
                mediaType = media.endsWith('.mp4') ? 'video' : 'gif'
                reply(`_❌ ERROR: Failed to convert ${mediaType} to sticker! ❌_`)
              })
              .on('end', function () {
                buildSticker()
              })
              .addOutputOptions(outputOptions)
              .toFormat('webp')
              .save(ran)

            async function buildSticker() {
              if (args.includes('nometadata') == true) {
                conn.sendMessage(from, fs.readFileSync(ran), sticker, {
                  quoted: mek
                })
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              } else {
                const webpWithMetadata = await WSF.setMetadata(packName, authorName, ran)
                conn.sendMessage(from, webpWithMetadata, MessageType.sticker)
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              }
            }
          }
          break;

        case 'twd':
          try {
            (async () => {
              const browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
              })
              const page = await browser.newPage();
              await page
                .goto("https://id.savefrom.net/download-from-twitter", {
                  waitUntil: "networkidle2",
                })
                .then(async () => {
                  await page.type("#sf_url", args[0]);
                  await page.click("#sf_submit");
                  await new Promise(resolve => setTimeout(resolve, 5000));
                  try {
                    await page.waitForSelector("#sf_result");
                    const element = await page.$("a.link-download");
                    const link = await (await element.getProperty("href")).jsonValue();
                    const text = await (await element.getProperty("download")).jsonValue();

                    const filename = new Date().getTime()
                    const path = `./public/${filename}.mp4`;
                    const file = fs.createWriteStream(path);
                    const request = http.get(link, function (response) {
                      response.pipe(file);
                    })

                    file.on("finish", async () => {
                      const videonya = fs.readFileSync(path)
                      try {
                        await conn.sendMessage(from, videonya, video, {
                          caption: `*🙇‍♂️ Berhasil*\n\n${text}`
                        })
                        fs.unlinkSync(path)
                      } catch (e) {
                        console.error(e)
                        reply(`Error waktu kirim file ke kamu, namun kami masih memiliki linknya: ${link}, silahkan download sendiri ya.`)
                        fs.unlinkSync(path)
                      }
                    })

                  } catch (error) {
                    console.log(error);
                    reply(`error`)
                  }
                })
                .catch((err) => {
                  console.log(err);
                  reply(`error`)
                });
              browser.close();
            })();
          } catch (err) {
            console.log(err);
            reply(`error`)
          }
          break;

        case 'ytmp3':

          if (!YTDL.validateURL(args[0])) {
            reply(`*⛔ Maaf*\n\nUrl video tidak valid atau kami tidak menemukan apapun!`)
            return
          }

          const filename = getRandom(".mp3")
          const path = `./public/${filename}`

          const videoID = YTDL.getURLVideoID(args[0])
          const info = await YTDL.getInfo(videoID)

          reply(`*⏳ Tunggu Sebentar*\n\nDownload musik sedang kami proses.`)

          let stream = YTDL(args[0], {
            filter: info => info.audioBitrate == 160 || info.audioBitrate == 128
          })

          let simp = fs.createWriteStream(path);
          let simpen = stream.pipe(simp)

          simpen.on("finish", async () => {
            let stats = fs.statSync(path)
            let url_download = URL + "/public/" + filename

            if (stats.size < 29999999) { // jika ukuran file kurang dari 30 mb
              reply(`*🙇‍♂️ Berhasil*\n\n*Judul:* ${info.videoDetails.title}\n*Size:* ${formatBytes(stats.size)}\n\n_kami mencoba mengirimkanya ke anda_`)
              try {
                const musiknya = fs.readFileSync(path)
                await conn.sendMessage(from, musiknya, audio)
              } catch (e) {
                console.error(e)
                reply(`*⛔ Maaf*\n\nTerjadi kesalahan saat mengirimkan file, anda dapat mengunduhnya secara manual melalui link berikut.\n\n${await shortlink(url_download)}`)
              }
              fs.unlinkSync(path)
            } else {
              reply(`*🙇‍♂️ Berhasil*\n\n*Judul:* ${info.videoDetails.title}\n*Size:* ${formatBytes(stats.size)}\n\n*Link:* ${await shortlink(url_download)}`)
            }
          });

          simpen.on("error", (e) => {
            console.error(e)
            reply(`*⛔ Maaf*\n\nTerjadi kesalahan pada server kami!`)
          })
          break

        case 'ytmp4':

          if (!YTDL.validateURL(args[0])) {
            reply(`*⛔ Maaf*\n\nUrl video tidak valid atau kami tidak menemukan apapun!`)
            return
          }

          let mvideoID = YTDL.getURLVideoID(args[0])
          let minfo = await YTDL.getInfo(mvideoID)

          reply(`*⏳ Tunggu Sebentar*\n\nDownload video sedang kami proses.`)

          let mstream = YTDL(args[0], {
            filter: info => info.itag == 22 || info.itag == 18
          })

          const mfilename = getRandom(".mp4")
          let mpath = `./public/${mfilename}`

          let msimp = fs.createWriteStream(mpath);
          let msimpen = mstream.pipe(msimp)

          msimpen.on("finish", async () => {

            let stats = fs.statSync(mpath)
            let url_download = URL + "/public/" + mfilename

            if (stats.size < 79999999) { // jika ukuran file kurang dari 80 mb || batas max whatsapp
              reply(`*🙇‍♂️ Berhasil*\n\n*Judul:* ${minfo.videoDetails.title}\n*Size:* ${formatBytes(stats.size)}\n\n_kami mencoba mengirimkanya ke anda_`)
              try {
                const videonya = fs.readFileSync(mpath)
                await conn.sendMessage(from, videonya, video)
              } catch (error) {
                console.error(error)
                reply(`*⛔ Maaf*\n\nTerjadi kesalahan saat mengirimkan file, anda dapat mengunduhnya secara manual melalui link berikut.\n\n${await shortlink(url_download)}`)
              }
              fs.unlinkSync(path)
            } else {
              reply(`*🙇‍♂️ Berhasil*\n\n*Judul:* ${minfo.videoDetails.title}\n*Size:* ${formatBytes(stats.size)}\n\n*Link:* ${await shortlink(url_download)}`)
            }
          });

          msimpen.on("error", (e) => {
            console.error(e)
            reply(`*⛔ Maaf*\n\nTerjadi kesalahan pada server kami!`)
          })
          break

        case 'yt':
          var urlyt = args[0];
          console.log(urlyt)
          const dm = async (url) => {
            let info = YTDL.getInfo(url)
            const stream = YTDL(url, {
                filter: info => info.itag == 22 || info.itag == 18
              })
              .pipe(fs.createWriteStream('./public/video.mp4'));
            console.log("video downloading")
            await new Promise((resolve, reject) => {
              stream.on('error', reject)
              stream.on('finish', resolve)
            }).then(async (res) => {
              console.log("video sending")
              await conn.sendMessage(
                from,
                fs.readFileSync('./public/video.mp4'),
                video, {
                  mimetype: Mimetype.mp4
                }
              ).then((res) => {
                console.log("Sent")
              })
              .catch((e) => {
                reply `Enable to download send a valid req`
              })
              .finally(() => {
                fs.unlinkSync("./public/video.mp4")
              })

            }).catch((err) => {
              reply `Unable to download,contact dev.`;
            });

          }
          dm(urlyt)
          break

        case 'yts':
          var url1 = args[0];
          console.log(`${url1}`)
          const am = async (url1) => {
            let info = YTDL.getInfo(url1)
            const stream = YTDL(url1, {
                filter: info => info.audioBitrate == 160 || info.audioBitrate == 128
              })
              .pipe(fs.createWriteStream('./public/audio.mp3'));
            console.log("audio downloading")
            await new Promise((resolve, reject) => {
              stream.on('error', reject)
              stream.on('finish', resolve)
            }).then(async (res) => {
              console.log("audio sending")
              await conn.sendMessage(
                  from,
                  fs.readFileSync('./public/audio.mp3'),
                  MessageType.audio, {
                    mimetype: Mimetype.mp4Audio
                  }
                ).then((resolved) => {
                  console.log("Sent")
                })
                .catch((reject) => {
                  reply `Enable to download send a valid req`
                })
                .finally(() => {
                  fs.unlinkSync("./public/audio.mp3")
                })

            }).catch((err) => {
              reply `Unable to download,contact dev.`;
            });

          }
          am(url1)
          break
        
        case 'igdl':
        case 'igdown':
        case 'igdownloader':
          const ig_downloader = async (url) => {
            console.log("igdl process", url)
          
            if (url.substring(0, 8) === 'https://' || url.substring(0, 7) === 'http://'|| url.substring(0,21) === 'https://www.instagram' || url.substring(0,20) === 'http://www.instagram.com'){
              request(url, (error, response, html) => {
                if (!error) {
                  let $ = cheerio.load(html);
          
                  //basic data from the meta tags
                  // let image_link = $('meta[property="og:image"]').attr('content');
                  let video_link = $('meta[property="og:video"]').attr('content')
                  // let type = $('meta[property="og:type"]').attr('content');
                  // let url = $('meta[property="og:url"]').attr('content');
                  let title = $('meta[property="og:title"]').attr('content');

                  if(!video_link){
                    reply(`url yang kamu kirim tidak mengandung video`)
                    return
                  }
                  
                  console.log('downloading')
                  const path = `./public/ig_video.mp4`;
                  const file = fs.createWriteStream(path);
                  const request = http.get(video_link, function (response) {
                    response.pipe(file)
                  })
          
                  file.on("finish", async (res) => {
                    console.log('sending')
                    await conn.sendMessage(
                      from,
                      fs.readFileSync('./public/ig_video.mp4'),
                      video, {
                        mimetype: Mimetype.mp4,
                        caption: "```" + title + "```"
                      }
                    ).then((res) => {
                      console.log("sent")
                    })
                  })

                  request.on("error", (e) => {
                    console.error("request error", e)
                    reply(`terjadi kesalahan saat mengunduh media`)
                  })

                  file.on("error", (e) => {
                    console.error(e)
                    reply(`terjadi kesalahan saat mengunduh media`)
                  })
          
                } else {
                  reply(`terjadi kesalahan saat mengunduh media`)
                }
              });
            } else {
              reply('URL yang kamu berikan tidak valid')
            }
          }
          
          ig_downloader(args[0])
          break

        case "ocr":
          if ((isMedia && !mek.message.videoMessage || isQuotedImage) && args.length == 0) {
            const media = isQuotedImage ? JSON.parse(JSON.stringify(mek).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : mek

            const filePath = await conn.downloadAndSaveMediaMessage(media, `./public/${getRandom()}`)

            await recognize(filePath, {
                lang: 'eng+ind',
                oem: 1,
                psm: 3
              })
              .then(teks => {
                reply(teks.trim())
                fs.unlinkSync(filePath)
              })
              .catch(err => {
                reply("OCR gagal")
                console.error("OCR error: ", err)
                fs.unlinkSync(filePath)
              })

            function recognize(filename, config = {}) {
              const options = getOptions(config)
              const binary = config.binary || "tesseract"

              const command = [binary, `"${filename}"`, "stdout", ...options].join(" ")
              if (config.debug) log("command", command)

              return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                  if (config.debug) log(stderr)
                  if (error) reject(error)
                  resolve(stdout)
                })
              })
            }

            function getOptions(config) {
              const ocrOptions = ["tessdata-dir", "user-words", "user-patterns", "psm", "oem", "dpi"]

              return Object.entries(config)
                .map(([key, value]) => {
                  if (["debug", "presets", "binary"].includes(key)) return
                  if (key === "lang") return `-l ${value}`
                  if (ocrOptions.includes(key)) return `--${key} ${value}`

                  return `-c ${key}=${value}`
                })
                .concat(config.presets)
                .filter(Boolean)
            }
          } else {
            reply(`Kamu belum melampirkan foto yang akan discan.!`)
            return
          }
          break

        case 'cb':
        case 'carbon':
          let carbon_txt = args.join(' ')
          // Special thanks to Sumanjay for his carbon api
          const cb = async (carbon_txt) => {
            console.log("memproses carbon" + carbon_txt)
            await axios({
              method: 'post',
              url: 'https://carbonara.vercel.app/api/cook',
              data: {  
                "code": carbon_txt
              },
              responseType: 'arraybuffer'
            })
              .then(async (res) => {
                console.log("mengirim")
                await conn.sendMessage(from, Buffer.from(res.data), image, { caption: `Hasil untuk 👇\n` + "```" + carbon_txt + "```" })
                  .then(() => {
                    console.log("terkirim")
                  })
                  .catch((e) => {
                    console.error(e)
                    reply(`*⛔ Maaf*\n\n` + "```Terjadi kesalahann pada saat memproses data.```")
                  })
              })
              .catch((e) => {
                console.error(e)
                reply(`*⛔ Maaf*\n\n` + "```Terjadi kesalahann pada saat memproses data.```")
              })
          }
          cb(carbon_txt)
          break

        case 'qr':
        case 'qr-code':
          const qr_txt = args.join(" ")
          const qr_fun = async (qr_txt) => {
            console.log("memproses qr: " + qr_txt)
            const hasil = qr.imageSync(qr_txt, { ec_level: 'H', type: 'png' })
            await conn.sendMessage(from, hasil, image, { caption: `QR code untuk 👇\n` + "```" + qr_txt + "```" })
              .then(() => {
                console.log("terkirim")
              })
              .catch((e) => {
                console.error(e)
                reply(`*⛔ Maaf*\n\n` + "```Terjadi kesalahann pada saat memproses data.```")
              })
          }
          qr_fun(qr_txt)
          break

        default:
          break;
      }
    } catch (e) {
      console.error('Error : %s', e)
    }
  })
}
main()
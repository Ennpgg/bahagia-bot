const cheerio = require("cheerio")
const axios = require("axios")
const qs = require("qs")
const FileType = require('file-type')
const got = require('got')

const fs = require('fs')


function igdl(url) {
  return new Promise(async (resolve, reject) => {
    axios.request({
        url: 'https://www.instagramsave.com/download-instagram-videos.php',
        method: 'GET',
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "cookie": "PHPSESSID=ugpgvu6fgc4592jh7ht9d18v49; _ga=GA1.2.1126798330.1625045680; _gid=GA1.2.1475525047.1625045680; __gads=ID=92b58ed9ed58d147-221917af11ca0021:T=1625045679:RT=1625045679:S=ALNI_MYnQToDW3kOUClBGEzULNjeyAqOtg"
        }
      })
      .then(({
        data
      }) => {
        const $ = cheerio.load(data)
        const token = $('#token').attr('value')
        let config = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
            "cookie": "PHPSESSID=ugpgvu6fgc4592jh7ht9d18v49; _ga=GA1.2.1126798330.1625045680; _gid=GA1.2.1475525047.1625045680; __gads=ID=92b58ed9ed58d147-221917af11ca0021:T=1625045679:RT=1625045679:S=ALNI_MYnQToDW3kOUClBGEzULNjeyAqOtg",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          data: {
            'url': url,
            'action': 'post',
            'token': token
          }
        }
        axios.post('https://www.instagramsave.com/system/action.php', qs.stringify(config.data), {
            headers: config.headers
          })
          .then(async ({
            data
          }) => {
            let url = data.medias[0].url
            let thumbnail = data.medias[0].preview
            const stream = got.stream(url)
            let size

            stream
              .on("downloadProgress", ({
                transferred,
                total,
                percent
              }) => {
                size = total
              })

            const filetype = await FileType.fromStream(stream)

            let result = [{
              status: true,
              ext: filetype.ext,
              mime: filetype.mime,
              size: size,
              url: url,
              thumbnail: thumbnail
            }]

            resolve(result)
          })
      })
      .catch((e) => {
        reject([{
          status: false,
          msg: e.message
        }])
      })
  })
}

function igstory(username) {
  return new Promise(async (resolve, reject) => {
    axios.request({
        url: 'https://www.instagramsave.com/instagram-story-downloader.php',
        method: 'GET',
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "cookie": "PHPSESSID=ugpgvu6fgc4592jh7ht9d18v49; _ga=GA1.2.1126798330.1625045680; _gid=GA1.2.1475525047.1625045680; __gads=ID=92b58ed9ed58d147-221917af11ca0021:T=1625045679:RT=1625045679:S=ALNI_MYnQToDW3kOUClBGEzULNjeyAqOtg"
        }
      })
      .then(({
        data
      }) => {
        const $ = cheerio.load(data)
        const token = $('#token').attr('value')
        let config = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
            "cookie": "PHPSESSID=ugpgvu6fgc4592jh7ht9d18v49; _ga=GA1.2.1126798330.1625045680; _gid=GA1.2.1475525047.1625045680; __gads=ID=92b58ed9ed58d147-221917af11ca0021:T=1625045679:RT=1625045679:S=ALNI_MYnQToDW3kOUClBGEzULNjeyAqOtg",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          data: {
            'url': 'https://www.instagram.com/' + username,
            'action': 'story',
            'token': token
          }
        }
        axios.post('https://www.instagramsave.com/system/action.php', qs.stringify(config.data), {
            headers: config.headers
          })
          .then(({
            data
          }) => {
            let result
            let jumlah
            try {
              jumlah = data.medias.length
            } catch (error) {
              result = [{
                status: false,
                msg: "Media tidak ditemukan"
              }]
            }
            if (jumlah >= 1) {
              result = [{
                status: true,
                data: data.medias
              }]
            } else {
              result = [{
                status: false,
                msg: "Media tidak ditemukan"
              }]
            }
            resolve(result)

          })
      })
      .catch(reject)
  })
}

function igstalk(username) {
  return new Promise((resolve, reject) => {
    axios.get('https://www.instagram.com/' + username + '/?__a=1', {
        method: 'GET',
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
          "cookie": "mid=XBXl1AALAAEbFoAEfNjZlMMG9dwX; ig_did=91E66A48-5AA2-445D-BFE6-84DC4456DE8F; fbm_124024574287414=base_domain=.instagram.com; ig_nrcb=1; shbid=\"12737\0544008624962\0541656157971:01f72a5102dc07af6845adf923ca70eb86e81ab95fa9dbfdaf157c9eef0e82fd1f10fe23\"; shbts=\"1624621971\0544008624962\0541656157971:01f74841fba8e77a0066b47ea891dec8fba6fdf9216c0816f9fb3532292f769828800ae2\"; fbsr_124024574287414=86D8femzH4_KFW4hd3Z6XFdowU6lG-uXsXRQDNl44VM.eyJ1c2VyX2lkIjoiMTAwMDA0Njc2MDc4Nzg5IiwiY29kZSI6IkFRQngzXzVOejdwVnBwby1LRGRUdEYxUFlzcUdDQXJjcmJfb05HaWFvYkNvOGtLN2paam50bHpvMTNOakFnTzVKOHQ5M0V3U3dvNkRtZ0RiY1l1Z3dQSTIybnExOUxLd3lpZTVfZll0bkNXZXBuM1hoYWFLX0w2R0pZaUpzaDBOTDBhb3pmTVBkRTVQRC12X3FnbUgxLXZYdGVmcHhfaFU0aUZNZVMxNHhFUk5OblJyMmxYTUpDa2RFYTdISXNCR2swdHhaaGF0NUt4UDR3cWZTamRwcVFfQ19sa1RUek5fU0taUTYtMjlzTkdnLUVWb3oxMUZWc3Q2OEx2ZnlIY0V0eFp0ZUxacXpiWmh6MzZrVl83VmFGd0FqVnVkTGFQN2VzT3ZRcmlTQ2pLUE5XbVcyNWhudzIzejJBSnVURW00YWR1cmN6a3ZLWU1icTd2SnN0SVdJV09RIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUJBZmJuQ3haQzZMd3h4MDFJV2MyZ3dsQ3k3Qmp0b05UNUY0WDY2NHBrUzRQeERNVXRsdmhWWkI3SXE0MGsyZ2hJQm55RHRPcW5iVjlPbUNiWGhyTFBaQUhBQjFzVFpBdHF6RFEzVTROUkhOU1V6MFVXWkNtTEdLcDNNWDRoazVIOURLbERHN0QwUlhZNHY4dHBCdVNNYjN4dnBTRGtQcHdYRlBXVU82VCIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjI0NjIxOTgxfQ; fbsr_124024574287414=86D8femzH4_KFW4hd3Z6XFdowU6lG-uXsXRQDNl44VM.eyJ1c2VyX2lkIjoiMTAwMDA0Njc2MDc4Nzg5IiwiY29kZSI6IkFRQngzXzVOejdwVnBwby1LRGRUdEYxUFlzcUdDQXJjcmJfb05HaWFvYkNvOGtLN2paam50bHpvMTNOakFnTzVKOHQ5M0V3U3dvNkRtZ0RiY1l1Z3dQSTIybnExOUxLd3lpZTVfZll0bkNXZXBuM1hoYWFLX0w2R0pZaUpzaDBOTDBhb3pmTVBkRTVQRC12X3FnbUgxLXZYdGVmcHhfaFU0aUZNZVMxNHhFUk5OblJyMmxYTUpDa2RFYTdISXNCR2swdHhaaGF0NUt4UDR3cWZTamRwcVFfQ19sa1RUek5fU0taUTYtMjlzTkdnLUVWb3oxMUZWc3Q2OEx2ZnlIY0V0eFp0ZUxacXpiWmh6MzZrVl83VmFGd0FqVnVkTGFQN2VzT3ZRcmlTQ2pLUE5XbVcyNWhudzIzejJBSnVURW00YWR1cmN6a3ZLWU1icTd2SnN0SVdJV09RIiwib2F1dGhfdG9rZW4iOiJFQUFCd3pMaXhuallCQUJBZmJuQ3haQzZMd3h4MDFJV2MyZ3dsQ3k3Qmp0b05UNUY0WDY2NHBrUzRQeERNVXRsdmhWWkI3SXE0MGsyZ2hJQm55RHRPcW5iVjlPbUNiWGhyTFBaQUhBQjFzVFpBdHF6RFEzVTROUkhOU1V6MFVXWkNtTEdLcDNNWDRoazVIOURLbERHN0QwUlhZNHY4dHBCdVNNYjN4dnBTRGtQcHdYRlBXVU82VCIsImFsZ29yaXRobSI6IkhNQUMtU0hBMjU2IiwiaXNzdWVkX2F0IjoxNjI0NjIxOTgxfQ; csrftoken=PpiPMEl0R2pAwThsw4NXynO6cVIXHZDo; ds_user_id=38316792800; sessionid=38316792800:rQj5Tr3g5zkg7b:4; rur=\"RVA\05438316792800\0541656158332:01f759cf624bef147397144805bb4c26f6c8b36a232e0f5738c570ee492f6b629f84f6e5\""
        }
      })
      .then(({
        data
      }) => {
        const user = data.graphql.user
        let result = {
          id: user.id,
          biography: user.biography,
          followers: user.edge_followed_by.count,
          following: user.edge_follow.count,
          fullName: user.full_name,
          highlightCount: user.highlight_reel_count,
          isBusinessAccount: user.is_business_account,
          isRecentUser: user.is_joined_recently,
          accountCategory: user.business_category_name,
          linkedFacebookPage: user.connected_fb_page,
          isPrivate: user.is_private,
          isVerified: user.is_verified,
          profilePicHD: user.profile_pic_url_hd,
          username: user.username,
          postsCount: user.edge_owner_to_timeline_media.count
        }
        resolve(result)
      })
      .catch(reject)
  })
}

// https://github.com/Hexagonz/Hexa-Api
const twdl = (link) => {
  return new Promise((resolve, reject) => {
    let config = {
      'URL': link
    }
    axios.post('https://twdown.net/download.php', qs.stringify(config), {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "cookie": "_ga=GA1.2.1388798541.1625064838; _gid=GA1.2.1351476739.1625064838; __gads=ID=7a60905ab10b2596-229566750eca0064:T=1625064837:RT=1625064837:S=ALNI_Mbg3GGC2b3oBVCUJt9UImup-j20Iw; _gat=1"
        }
      })
      .then(async ({
        data
      }) => {
        const $ = cheerio.load(data)

        const thumbnail = $('div:nth-child(1) > img').attr('src')
        const desc = $('div:nth-child(1) > div:nth-child(2) > p').text().trim()
        let ksd
        let khd

        // Coba SD
        try {
          const sd = $('tr:nth-child(2) > td:nth-child(4) > a').attr('href')
          let streamsd = got.stream(sd)
          let sizesd

          streamsd
            .on("downloadProgress", ({
              transferred,
              total,
              percent
            }) => {
              sizesd = total
            })

          const filetypesd = await FileType.fromStream(streamsd)
          ksd = {
            ext: filetypesd.ext,
            mime: filetypesd.mime,
            size: sizesd,
            url: sd,
          }
        } catch (e) {
          ksd = {
            msg: "kualitas sd tidak tersedia"
          }
        }

        // Coba HD
        try {
          const hd = $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href')
          let streamhd = got.stream(hd)
          let sizehd

          streamhd
            .on("downloadProgress", ({
              transferred,
              total,
              percent
            }) => {
              sizehd = total
            })

          const filetypehd = await FileType.fromStream(streamhd)
          khd = {
            ext: filetypehd.ext,
            mime: filetypehd.mime,
            size: sizehd,
            url: hd,
          }
        } catch (e) {
          khd = {
            msg: "kualitas hd tidak tersedia"
          }
        }

        let result = {
          status: true,
          thumbnail: thumbnail,
          desc: desc,
          data: {ksd, khd}
        }
        resolve(result)
      })
      .catch((e) => {
        reject({
          status: false,
          msg: e.message
        })
      })
  })
}

// https://github.com/victorsouzaleal/twitter-direct-url
const twdl2 = (url_media) => {
  return new Promise((resolve, reject) => {
    let twitter_url_array = url_media.split("/")
    twitter_url_array[5] = twitter_url_array[5].split("?")[0]
    url_media = twitter_url_array.join("/")
    var url = url_media.replace("twitter", "ssstwitter")
    const requestBody = {
      id: url_media,
      tt: "48277062996429953dc378d8675febbc",
      ts: 1614856639
    }
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    axios.post(url, qs.stringify(requestBody), config).then(async ({data}) => {
      let $ = cheerio.load(data)

      let thumbnail = $('div.result_overlay > img').attr("src")
      let desc = $('div.result_overlay > p').text()

      try {
        let sd = $('div.result_overlay > a:nth-child(5)').attr("href")
        let streamsd = got.stream(sd)
        let sizesd

        streamsd
        .on("downloadProgress", ({ transferred, total, percent }) => {
          sizesd = total
        })

        const filetypesd = await FileType.fromStream(streamsd)

        ksd = {
          ext: filetypesd.ext,
          mime: filetypesd.mime,
          size: sizesd,
          url: sd,
        }

      } catch (error) {
        ksd = {
          msg: "kualitas sd tidak tersedia"
        }
      }

      try {
        let hd = $('div.result_overlay > a:nth-child(4)').attr("href")
        let streamhd = got.stream(hd)
        let sizehd
        
        streamhd
          .on("downloadProgress", ({ transferred, total, percent }) => {
            sizehd = total
          })

        const filetypehd = await FileType.fromStream(streamhd)

        khd = {
          ext: filetypehd.ext,
          mime: filetypehd.mime,
          size: sizehd,
          url: hd,
        }
      } catch (error) {
        khd = {
          msg: "kualitas hd tidak tersedia"
        }
      }

      let result = {
        status: true,
        thumbnail: thumbnail,
        desc: desc,
        data: {ksd, khd}
      }
      resolve(result)
    }).catch((e) => {
      reject({
        status: false,
        msg: e.message
      })
    })
  })
}

const twdl3 = (url) => {
  return new Promise((resolve, reject) => {
    axios.get('https://twittervideodownloader.com/', {
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "cookie": "PHPSESSID=9ut8phujrprrmll6oc3bist01t; popCookie=1; _ga=GA1.2.1068750365.1625213061; _gid=GA1.2.842420949.1625213061"
      }
    })
      .then(({ data }) => {
        const $ = cheerio.load(data)
        let token = $('input[name=csrfmiddlewaretoken]').attr('value')

        let config = {
          headers: {
            'authority': 'twittervideodownloader.com',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'referer': 'https://twittervideodownloader.com/',
            'cookie': 'csrftoken='+ token +';'
          },
          data: {
            'csrfmiddlewaretoken': token,
            'tweet': url,
            'submit': ''
          }
        }
        axios.post('https://twittervideodownloader.com/download', qs.stringify(config.data), { headers: config.headers })
          .then(async ({ data }) => {
            const $ = cheerio.load(data)
           
            let thumbnail = $('center > img:nth-child(4)').attr("src")
            let desc = null

            try {
              let sd = $("center > div:nth-child(18) > div > a").attr("href")
              let streamsd = got.stream(sd)
              let sizesd

              streamsd
              .on("downloadProgress", ({ transferred, total, percent }) => {
                sizesd = total
              })

              const filetypesd = await FileType.fromStream(streamsd)

              ksd = {
                ext: filetypesd.ext,
                mime: filetypesd.mime,
                size: sizesd,
                url: sd,
              }

            } catch (error) {
              ksd = {
                err: error.message,
                sd: sd,
                msg: "kualitas sd tidak tersedia"
              }
            }

            try {
              let hd = $("center > div:nth-child(17) > div > a").attr("href")
              let streamhd = got.stream(hd)
              let sizehd
              
              streamhd
                .on("downloadProgress", ({ transferred, total, percent }) => {
                  sizehd = total
                })

              const filetypehd = await FileType.fromStream(streamhd)

              khd = {
                ext: filetypehd.ext,
                mime: filetypehd.mime,
                size: sizehd,
                url: hd,
              }
            } catch (error) {
              khd = {
                err: error.message,
                hd: hd,
                msg: "kualitas hd tidak tersedia"
              }
            }

            let result = {
              status: true,
              thumbnail: thumbnail,
              desc: desc,
              data: {ksd, khd}
            }
            resolve(result)
          })
          .catch(async (e) => {
            // await new Promise(resolve => setTimeout(resolve, 3000));
            // twdl3(url)
            reject({
              status: false,
              msg: e.message
            })
          })
      })
      .catch(async (e) => {
        // await new Promise(resolve => setTimeout(resolve, 3000));
        // twdl3(url)
        reject({
          status: false,
          msg: e.message
        })
      })
  })
}

function fbdown(link) {
  return new Promise((resolve, reject) => {

    // const RegFb = /(?:http(?:s|):\/\/|)(?:www\.|)facebook.com\/([0-9A-Za-z]{2,16})\/videos\/([0-9]{2,18})/gi
    // if(RegFb.test(link)){
    //   reject('link invalid')
    // }

    let config = {
      'url': link
    }
    axios('https://www.getfvid.com/downloader', {
        method: 'POST',
        data: new URLSearchParams(Object.entries(config)),
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "cookie": "_ga=GA1.2.1310699039.1624884412; _pbjs_userid_consent_data=3524755945110770; cto_bidid=rQH5Tl9NNm5IWFZsem00SVVuZGpEd21sWnp0WmhUeTZpRXdkWlRUOSUyQkYlMkJQQnJRSHVPZ3Fhb1R2UUFiTWJuVGlhVkN1TGM2anhDT1M1Qk0ydHlBb21LJTJGNkdCOWtZalRtZFlxJTJGa3FVTG1TaHlzdDRvJTNE; cto_bundle=g1Ka319NaThuSmh6UklyWm5vV2pkb3NYaUZMeWlHVUtDbVBmeldhNm5qVGVwWnJzSUElMkJXVDdORmU5VElvV2pXUTJhQ3owVWI5enE1WjJ4ZHR5NDZqd1hCZnVHVGZmOEd0eURzcSUyQkNDcHZsR0xJcTZaRFZEMDkzUk1xSmhYMlY0TTdUY0hpZm9NTk5GYXVxWjBJZTR0dE9rQmZ3JTNEJTNE; _gid=GA1.2.908874955.1625126838; __gads=ID=5be9d413ff899546-22e04a9e18ca0046:T=1625126836:RT=1625126836:S=ALNI_Ma0axY94aSdwMIg95hxZVZ-JGNT2w; cookieconsent_status=dismiss"
        }
      })
      .then(async ({
        data
      }) => {
        const $ = cheerio.load(data);
        resolve({
          Normal_video: $('div.col-md-4.btns-download > p:nth-child(2) > a').attr('href'),
          HD: $('div.col-md-4.btns-download > p:nth-child(1) > a').attr('href'),
          audio: $('div.col-md-4.btns-download > p:nth-child(3) > a').attr('href')
        })
      })
      .catch(reject)
  })
}

function youtube(link) {
  return new Promise((resolve, reject) => {
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
    if (ytIdRegex.test(link)) {
      let url = ytIdRegex.exec(link)
      let config = {
        'url': 'https://www.youtube.be/' + url,
        'q_auto': 0,
        'ajax': 1
      }
      let headerss = {
        "sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Cookie": 'PHPSESSID=6jo2ggb63g5mjvgj45f612ogt7; _ga=GA1.2.405896420.1625200423; _gid=GA1.2.2135261581.1625200423; _PN_SBSCRBR_FALLBACK_DENIED=1625200785624; MarketGidStorage={"0":{},"C702514":{"page":5,"time":1625200846733}}'
      }
      axios('https://www.y2mate.com/mates/en68/analyze/ajax', {
          method: 'POST',
          data: new URLSearchParams(Object.entries(config)),
          headers: headerss
        })
        .then(({
          data
        }) => {
          const $ = cheerio.load(data.result)
          let img = $('div.thumbnail.cover > a > img').attr('src');
          let title = $('div.thumbnail.cover > div > b').text();
          let size = $('#mp4 > table > tbody > tr:nth-child(3) > td:nth-child(2)').text()
          let size_mp3 = $('#audio > table > tbody > tr:nth-child(1) > td:nth-child(2)').text()
          let id = /var k__id = "(.*?)"/.exec(data.result)[1]
          let configs = {
            type: 'youtube',
            _id: id,
            v_id: url[1],
            ajax: '1',
            token: '',
            ftype: 'mp4',
            fquality: 480
          }
          axios('https://www.y2mate.com/mates/en68/convert', {
              method: 'POST',
              data: new URLSearchParams(Object.entries(configs)),
              headers: headerss
            })
            .then(({
              data
            }) => {
              const $ = cheerio.load(data.result)
              let link = $('div > a').attr('href')
              let configss = {
                type: 'youtube',
                _id: id,
                v_id: url[1],
                ajax: '1',
                token: '',
                ftype: 'mp3',
                fquality: 128
              }
              axios('https://www.y2mate.com/mates/en68/convert', {
                  method: 'POST',
                  data: new URLSearchParams(Object.entries(configss)),
                  headers: headerss
                })
                .then(({
                  data
                }) => {
                  const $ = cheerio.load(data.result)
                  let audio = $('div > a').attr('href')
                  resolve({
                    id: url[1],
                    title: title,
                    size: size,
                    quality: '480p',
                    thumb: img,
                    link: link,
                    size_mp3: size_mp3,
                    mp3: audio
                  })
                })
            })
        })
        .catch(reject)
    } else {
      reject('link invalid')
    }
  })
}

module.exports.pln = async(id) => {
  return new Promise((resolve, reject) => {
    axios.get('https://www.hotelmurah.com/pulsa/pln/', {
        withCredentials: true,
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      })
      .then(async (data) => {
        const $ = cheerio.load(data.data)
        const token = $(".txt_csrfname").attr("value")
        let cookie = data.headers['set-cookie'].toString()
        let cookies = cookie.split(";")
        let csrf_cook, ses_id_cook
        cookies.forEach((v,i) => {
          if(i==0){
            csrf_cook = v.split("=")[1]
          }
          if(i==4){
            ses_id_cook = v.split("=")[2]
          }
        })

        let config = {
          'id': id,
          'jenis': '1',
          'kode': 'TU',
          'hm_csrf_hash_name': token
        }

        let headersss = {
          'cookie': '_ga=GA1.2.1427732230.1630150507; ci_session=r1gusav7h1k0sg913reteeofhmvo30kd; _gid=GA1.2.442278703.1631370145; hotelmurah_hm_cookie='+ ses_id_cook +'; hotelmurah_csrf_cookie_name=' + csrf_cook,
        }

        axios('https://www.hotelmurah.com/pulsa/index.php/pln/cari_id_android', {
            method: 'POST',
            data: new URLSearchParams(Object.entries(config)),
            headers: headersss
          })
          .then(({
            data
          }) => {
            // const $ = cheerio.load(data)
            if(data.status == 70){
              console.error("Pengecekan tagihan listrik tidak dilayani pada pukul 23:00 hingga 01:00 WIB sesuai ketentuan dari PLN.")
            }
            resolve(data)
          })
          .catch((e) => {
            // console.error(e)
            reject(e.message)
          })

      })
      .catch((e) => {
        // console.error(e)
        reject(e.message)
      })
  })
}

function ttdownloader(url) {
  return new Promise(async (resolve, reject) => {
    axios.get('https://ttdownloader.com/', {
        headers: {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "cookie": "PHPSESSID=9ut8phujrprrmll6oc3bist01t; popCookie=1; _ga=GA1.2.1068750365.1625213061; _gid=GA1.2.842420949.1625213061"
        }
      })
      .then(({
        data
      }) => {
        const $ = cheerio.load(data)
        let token = $('#token').attr('value')
        let config = {
          'url': url,
          'format': '',
          'token': token
        }
        axios('https://ttdownloader.com/req/', {
            method: 'POST',
            data: new URLSearchParams(Object.entries(config)),
            headers: {
              "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
              "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              "cookie": "PHPSESSID=9ut8phujrprrmll6oc3bist01t; popCookie=1; _ga=GA1.2.1068750365.1625213061; _gid=GA1.2.842420949.1625213061"
            }
          })
          .then(({
            data
          }) => {
            const $ = cheerio.load(data)
            resolve({
              nowm: $('div:nth-child(2) > div.download > a').attr('href'),
              wm: $('div:nth-child(3) > div.download > a').attr('href'),
              audio: $('div:nth-child(4) > div.download > a').attr('href')
            })
          })
      })
      .catch(reject)
  })
}

module.exports.igdl = igdl
module.exports.igstory = igstory
module.exports.igstalk = igstalk
module.exports.twdl = twdl
module.exports.twdl2 = twdl2
module.exports.twdl3 = twdl3
module.exports.fbdl = fbdown
module.exports.ytdl = youtube
module.exports.ttdl = ttdownloader
const axios = require('axios').default;
const api_url = 'https://music.youtube.com/youtubei/v1'

const map = (object) => {
    const runs = [...object.flexColumns]
        .map(e => e['musicResponsiveListItemFlexColumnRenderer'].text.runs.map(e => e.text).join(''));
    const artists = runs[1].split(/[,&]/g).map(e => e.trim());
    const duration = (Number(runs[3].split(':')[0]) * 60) + Number(runs[3].split(':')[1]);
    const id = object['doubleTapCommand'].watchEndpoint.videoId;
    return { id, title: runs[0], artists, album: runs[2], duration };
};

module.exports = class YoutubeMusic {

    constructor(api_key) {
        this.api_key = api_key;
    }

    async search(query, limit = 10) {
        const data = YoutubeMusic.assign('Eg-KAQwIARAAGAAgACgAMABqCBADEAQQCRAF', { query });
        const res = await axios.post('/search', data, {
            baseURL: api_url,
            params: { key: this.api_key },
            headers: { 'Origin': 'https://music.youtube.com' }
        });
        return [...res.data['contents'].sectionListRenderer.contents[0].musicShelfRenderer.contents]
            .slice(0, limit).map(e => map(e['musicResponsiveListItemRenderer']));
    }

    getTrack(id) {
        return { id };
    }

    static assign(params, data) {
        const object = {
            context: {
                client: {
                    clientName: 'WEB_REMIX',
                    clientVersion: '0.1'
                }
            },
            params: params,
        };
        return Object.assign(object, data);
    }

}
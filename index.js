const axios = require('axios').default;
const api_url = 'https://music.youtube.com/youtubei/v1'

const track = (object) => {
    const runs = [...object.flexColumns]
        .map(e => e['musicResponsiveListItemFlexColumnRenderer'].text.runs.map(e => e.text).join(''));

    if (runs[1] !== 'Artist') {
        const id = object['doubleTapCommand'].watchEndpoint.videoId;
        const duration = (Number(runs[4].split(':')[0]) * 60) + Number(runs[4].split(':')[1]);
        switch (runs[1]) {
            case 'Video':
                return { id, title: runs[0], channel: runs[2] };
            case 'Song':
                const artists = runs[2].split(/[,&]/g).map(e => e.trim());
                return { id, title: runs[0], artists, album: runs[3], duration };
        }
    }
};

const parse = (contents) => {
    const top_result = [...find('Top result', contents).musicShelfRenderer.contents.map(e => track(e['musicResponsiveListItemRenderer']))][0];
    const songs = [...find('Songs', contents).musicShelfRenderer.contents].map(e => track(e['musicResponsiveListItemRenderer']));
    const videos = [...find('Videos', contents).musicShelfRenderer.contents.map(e => track(e['musicResponsiveListItemRenderer']))];

    if (top_result) {
        return { top_result, songs, videos };
    }
    return { songs, videos };
};

const find = (type, contents = []) => {
    return contents.filter(e => 'musicShelfRenderer' in e)
        .find(e => e.musicShelfRenderer.title.runs[0].text == type);
}

module.exports = class YoutubeMusic {

    constructor(api_key) {
        this.api_key = api_key;
    }

    async search(query) {
        const data = YoutubeMusic.assign({ query });
        const res = await axios.post('/search', data, {
            baseURL: api_url,
            params: { key: this.api_key },
            headers: { 'Origin': 'https://music.youtube.com' }
        });
        return parse([...res.data['contents'].sectionListRenderer.contents]);
    }

    static assign(data, params) {
        const object = {
            context: {
                client: {
                    clientName: 'WEB_REMIX',
                    clientVersion: '0.1'
                }
            }
        };
        if (params) object['params'] = params;
        return Object.assign(object, data);
    }

}
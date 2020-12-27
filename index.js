const axios = require('axios').default;
const api_url = 'https://music.youtube.com/youtubei/v1'

const track = ({ flexColumns = [], playlistItemData }) => {
    const runs = flexColumns.map(e => {
        const { musicResponsiveListItemFlexColumnRenderer } = e;
        const { text: { runs: values = [] } } = musicResponsiveListItemFlexColumnRenderer;

        return values.map(e => e.text).join('');
    }).map(e => e.split('•')).flat().map(e => e.trim());

    if (!['Artist', 'Playlist', 'Album'].includes(runs[1])) {
        const { videoId: id } = playlistItemData;
        const duration = (() => {
            const values = runs[4].split(':');

            return (Number(values[0]) * 60) + Number(values[1]);
        })();

        switch (runs[1]) {
            case 'Video':
                return { id, title: runs[0], artists: [runs[2]], duration };
            case 'Song':
                const artists = runs[2].split(/[,&]/g)
                    .map(e => e.trim());

                return { id, title: runs[0], artists, album: runs[3], duration };
        }
    }
};

const parse = (contents) => {
    const top = find('Top result',
        contents).map(track);

    const songs = find('Songs',
        contents).map(track);

    const videos = find('Videos',
        contents).map(track);

    return [...top, ...songs, ...videos]
        .filter(e => e !== undefined);
};

const find = (type, array = []) => {
    const object = array.filter(e => 'musicShelfRenderer' in e)
        .find(e => {
            const {
                musicShelfRenderer: { title: { runs } }
            } = e;
            const [{ text }] = runs;

            return text == type;
        });

    if (object !== undefined) {
        return object['musicShelfRenderer'].contents.map(e =>
            e['musicResponsiveListItemRenderer']
        ).filter(e => !('musicItemRendererDisplayPolicy' in e));
    }

    return [];
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

        const {
            contents: { sectionListRenderer: { contents = [] } }
        } = res.data;

        return parse(contents);
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
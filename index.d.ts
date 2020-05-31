declare class YoutubeMusic {

    api_key: string;

    /**
     * Creates a new instance of the Youtube Music API wrapper
     * @param api_key Youtube Music API key
     */
    constructor(api_key: string);

    /**
     * Searches for tracks
     * @param query The query to search for
     * @param limit The limit value for the returned results
     */
    search(query: string, limit?: number): Promise<SearchResult>;

}

export declare interface SearchResult {

    /**
     * The best result given by Youtube Music, it can be a Video or a Song
     */
    top_result?: Track;

    /**
     * The songs list
     */
    songs: Array<Track>;

    /**
     * The videos list
     */
    videos: Array<Track>;

}

export declare interface Track {

    /**
     * The video id for this track
     */
    id: string;

    /**
     * The track's title
     */
    title: string;

    /**
     * The track's artists
     */
    artists?: Array<string>;

    /**
     * The track's album name
     */
    album?: string;

    /**
     * The track's duration in seconds
     */
    duration: number;

}

export default YoutubeMusic;
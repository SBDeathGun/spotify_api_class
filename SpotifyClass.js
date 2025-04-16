import axios from "axios";
import { Buffer } from 'buffer';
export class SpotifyClass {
    clientID;
    clientSecret;
    token;
    tokentime;
    constructor(clientID, clientSecret) {
        this.clientID = clientID;
        this.clientSecret = clientSecret;
        this.token = null;
    }
    istokenexpired() {
        return (this.tokentime != undefined && this.tokentime.getHours !== (new Date).getHours);
    }
    async getToken() {
        if (this.token !== null && !this.istokenexpired())
            return this.token;
        var req = await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
            headers: {
                Authorization: `Basic ${Buffer.from(`${this.clientID}:${this.clientSecret}`).toString("base64")}`,
                Content_Type: "application/x-www-form-urlencoded"
            }
        });
        this.token = req.data.access_token;
        this.tokentime = new Date();
        return this.token;
    }
    async getAlbum(albumName) {
        let album = await this.searchAlbum(albumName);
        let req = await axios.get(`https://api.spotify.com/v1/albums/${album[0].id}`, {
            headers: { Authorization: `Bearer ${await this.getToken()}` }
        });
        return req.data;
    }
    async getPlaylist(playlistname, author) {
        let resSearch = (await this.searchPlaylist(playlistname));
        let id = "";
        if (author) {
            id = (await findPlaylistAuthor(resSearch, author, await this.getToken())).id;
        }
        else {
            id = resSearch.items[0].id;
        }
        let res = await axios.get(`https://api.spotify.com/v1/playlists/${id}`, {
            headers: { Authorization: `Bearer ${await this.getToken()}` }
        });
        return res.data;
    }
    async search(query, type, offset = 0) {
        let res = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=${type}&offset=${offset}`, {
            headers: {
                Authorization: `Bearer ${await this.getToken()}`
            }
        });
        let req = res.data[type + "s"];
        return req;
    }
    async searchArtist(query, offset = 0) {
        let control = await this.search(query, "artist", offset);
        return control.items;
    }
    async searchAlbum(query, offset = 0) {
        let control = await this.search(query, "album", offset);
        return control.items;
    }
    async searchPlaylist(query, offset = 0) {
        let control = await this.search(query, "playlist", offset);
        return control;
    }
}
async function findPlaylistAuthor(resSearch, author, token) {
    let items = resSearch.items;
    for (let el of items) {
        if (el && el.owner.display_name == author)
            return el;
    }
    return findPlaylistAuthor(await axios.get(resSearch.next, { headers: { Authorization: `Baerer: ${token}` } }), author, token);
}

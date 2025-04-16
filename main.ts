
import { SpotifyClass, Album,Playlist} from './SpotifyClass.js'
import { clientID, clientSecret } from './config.js'
let spotify = new SpotifyClass(clientID,clientSecret)
let res:Album = await spotify.getAlbum("23_6451")
console.log(res)

for(let i=0;i<res.tracks.items.length;i++){
    console.log(res.tracks.items[i].name)
}


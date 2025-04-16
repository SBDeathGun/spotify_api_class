
import axios from 'axios'
import { SpotifyClass, Album,Playlist} from './SpotifyClass.js'
import { clientID, clientSecret } from './config.js'
let spotify = new SpotifyClass(clientID,clientSecret)
//let res:Album = await spotify.getAlbum("23_6451")
//console.log(res)


let req:Playlist = await spotify.getPlaylist("robe a casos","Orazio Ferrera")
console.log(req)
let ArraycanzoniFinale:Array<string>=[]
let total =req.tracks.total
let tracks= req.tracks
while(total!=ArraycanzoniFinale.length){

    for(let i=0;i<tracks.items.length;i++){
        console.log(tracks.items[i].track.name)
        ArraycanzoniFinale.push(tracks.items[i].track.name)
    }
    if(tracks.next)
        tracks = (await axios.get(tracks.next,{headers:{Authorization:`Bearer ${await spotify.getToken()}` }})).data

}
console.log("ciao")

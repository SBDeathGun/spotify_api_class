import axios from "axios"
import {Buffer} from 'buffer';
export interface Artist{
  external_urls:{spotify:string}
  href:string
  id:string
  name:string
  type:string
  uri:string
}
interface Items{
  album_type:string,
  total_tracks:number,
  avaliable_markets:Array<string>,
  external_urls:{spotify:string}
  href:string
  id:string
  name:string
  relese_date:string
  type:string
  artists:Array<Artist>
}
export interface Album{
  album_type:string
  total_tracks:number
  id:string
  name:string
  artist:Array<Artist>
  tracks:Searchres<Track>
}
export interface Playlist{
  id:string,
  name:string,
  owner:{display_name:string,
         id:string
  },

}
interface Track{
  name:string
  id:string
}
interface Searchres<T>{
  href:string,
  limit:number
  next:string,
  offset:number,
  previus:string,
  total:number,
  items:Array<T>
}

export class SpotifyClass{
  private clientID:string
  private clientSecret:string
  private token:string | null
  private tokentime:Date | undefined
  constructor(clientID: string,clientSecret: string){
      this.clientID = clientID
      this.clientSecret = clientSecret
      this.token=null
  }
  istokenexpired():boolean{

    return (this.tokentime!=undefined && this.tokentime.getHours !== (new Date).getHours)
  }
  async getToken(){
    if(this.token!==null && !this.istokenexpired()) return this.token
    var req=await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers:{
          Authorization: `Basic ${Buffer.from(
                          `${this.clientID}:${this.clientSecret}`
                          ).toString("base64")}`,
          Content_Type: "application/x-www-form-urlencoded"
          }
        }
        )

      this.token = req.data.access_token
      this.tokentime =new Date()
      return this.token!  
  }

  async getAlbum(albumName: string){
    let album:Array<Album>=await this.searchAlbum(albumName)

    let req = await axios.get(
      `https://api.spotify.com/v1/albums/${album[0].id}`,
      {
        headers:{Authorization:`Bearer ${await this.getToken()}`} 
      }
    )

    return req.data
  }
  async getPlaylist(playlistname:string,author:string){
    let req = await axios.get(`https://api.spotify.com/v1/playlists/${(await this.searchPlaylist(playlistname))}`,
    {
      headers:{Authorization:`Bearer ${await this.getToken()}`} 
    })
    return req.data
  }
  async search<T>(query:string,type:string,offset:number=0):Promise<Searchres<T>>{
    
    let res =await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=${type}&offset=${offset}`,
        {
          headers:{
            Authorization:`Bearer ${await this.getToken()}`
          }
        }
    )
    let req:Searchres<T> = res.data[type+"s"]
    return req
  }
  async searchArtist(query:string,offset:number=0):Promise<Array<Artist>>{
    let control:Searchres<Artist> = await this.search(query,"artist",offset)
    return control.items
    
  }

  async searchAlbum(query:string,offset:number=0):Promise<Array<Album>>{
    let control:Searchres<Album> = await this.search(query,"album",offset)
    return control.items
  }
  async searchPlaylist(query:string,offset:number=0):Promise<Array<Playlist>>{
    let control:Searchres<Playlist> = await this.search(query,"playlist",offset)
    return control.items
  }
}


function instanceofArtist(obj: any):obj is Artist{
  return typeof obj == "object" && obj.type && obj.type==="artist"
}
function instanceofAlbum(obj: any):obj is Album{
  return typeof obj == "object" && obj.type && obj.type==="album"
}
function instanceofPlaylist(obj: any):obj is Playlist{
  return typeof obj == "object" && obj.type && obj.type==="playslist"
}


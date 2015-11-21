// es5 and 6 polyfills, powered by babel
require("babel/polyfill")

let fetch = require('./fetcher'),
	React = require('react'),
    $ = require('jquery'),
    Backbone = require('backbone'),
    _ = require('underscore')

console.log("jS loaded")


SC.initialize({
  client_id: '711c8eeb2551dd32b3aa94fc311ed846',
   redirect_uri: './callback.html'
});

window.SC = SC
// testid = 134079724

var SCcollection=Backbone.Collection.extend({
	url:"https://api.soundcloud.com/tracks/",
	client_id: "711c8eeb2551dd32b3aa94fc311ed846"
})


var SCmodel=Backbone.Model.extend({
	

})



var HomeView=React.createClass({

	render:function(){
		return(
			<div>
				<h2>Welcome to my Sound Cloud</h2>
				<SearchBar/>
			</div>
			)
	},

})

var SearchBar=React.createClass({

	_handleKeyPress:function(event){
		if (event.which===13)
			location.hash="search/"+event.target.value
	},

	render:function(){
		return(
			<input onKeyPress={this._handleKeyPress} type="text" placeholder="Search a track"/>
			)
	}
})


var SearchResultsView=React.createClass({
	render:function(){
		return(
			<div>
				<h2>Welcome to my Sound Cloud</h2>
				<SearchBar/>
				<Tracksbox tracks={this.props.tracks}/>
			</div>
			)
	}
})

var Tracksbox = React.createClass({
	
	getInitialState:function(){
		return{
			focusId:null,
			sound: false
		}
	},

	render:function(){
		
		return(
			<div>
				{this.props.tracks.map(this._genTrack)}
			</div>
			)
	},

	 _walkieTalkie: function(trackId,bool) {
        this.setState({
            focusId: trackId,
            sound:bool

        })
    },

	_genTrack:function(trackObj){
		return (<Track track={trackObj.attributes} focusId={this.state.focusId} parentCommunicator={this._walkieTalkie}  sound={this.state.sound} key={trackObj.attributes.id}/>)
	}

})

var Track=React.createClass({
	getInitialState: function(){
		return { player: null,
		 playing: false 
		}
	},

	componentWillUnmount:function(){//before the component is destroyed on the DOM
		if(this.state.player) this.state.player.destruct()
	},


	componentDidMount:function(){ //after the component mounts on the screen

		var self = this
		SC.stream(`/tracks/${this.props.track.id}`, function(player){
			self.setState({player: player})
	  	})


	  	this.state.plater.addEventListener("timeupdate", this._updateProgress, false)


	},

	render:function(){
		if(this.props.focusId===this.props.track.id)
		{
			console.log('yey!')
		}

		return(
			<div id="track">
				<img src={this.props.track.artwork_url}/>
				<p>{this.props.track.title}</p>
				<p>{this.props.track.user.username}</p>
				<p>likes:{this.props.track.likes_count}</p>
				<p>track play count:{this.props.track.playback_count}</p>
				<button onClick={this._stream}>play</button>
				<button onClick={this._volumUp}>+</button>
				<button onClick={this._volumDown}>-</button>
				<button onClick={this._mute}>mute</button>
				<button onClick={this._replay}>replay</button>
				<div id="progressBar"><span id="progress"></span></div>
			</div>
			)
	},


	_updateProgress:function() {
		var player = this.state.player
   var value = 0;
   if (player.position) {
      value = Math.floor((100 / player.duration) * player.position);
   }
   $('#progress').style.width = value + "%";
},

	_replay:function(){
		var player = this.state.player
		player.stop();
		player.play()
	},

	_mute:function(){
		var player = this.state.player
		if(player.muted) player.unmute()
		else player.mute()
	},

	_volumDown:function(){
		var player = this.state.player
		if(player.volume===0) return
		player.setVolume(player.volume-10)
	},

	_volumUp:function(){
		var player = this.state.player
		if(player.volume===100) return
		player.setVolume(player.volume+10)
	},

	_stream:function(){
		var parentCommunicator=this.props.parentCommunicator


		var player = this.state.player

		if(this.props.sound===true && this.props.focusId!=this.props.track.id) return

		if(!this.state.playing) {
			player.play()
			this.setState({playing:true})
			parentCommunicator(this.props.track.id, true)

		}
		else{

			player.pause()
			this.setState({playing:false})
			parentCommunicator(null, false)

		}
	}
})



var SCrouter=Backbone.Router.extend({

	routes:{
		'home':'showHomeView',
		'search/:query':'showSearchResults'
	},

	showHomeView:function(){
		this.renderHome()
	},

	renderHome:function(){
		React.render(<HomeView/>, document.querySelector('#container'))
	},

	showSearchResults:function(query){
		this.doFetch(query).done(this.renderSearch.bind(this))
	},

	renderSearch:function(){
		console.log(this.tc);
		React.render(<SearchResultsView tracks={this.tc.models}/>, document.querySelector('#container'))
	},


	doFetch:function(query){
		return this.tc.fetch({
			data:{
				q:query,
				client_id:this.tc.client_id
			},
			processData:true
		})
	},


	initialize:function(){
		this.tc=new SCcollection();
		this.tm=new SCmodel();
		Backbone.history.start();
	}

}
)

var router=new SCrouter();



// var player = SC.stream('/tracks/134079724',function(player){window.player=player})

// SC.stream('/tracks/134079724').then(function(player){window.p=player})
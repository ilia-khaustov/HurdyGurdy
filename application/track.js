function Track(object){
    if(object){
        var id = object.id;
        var artist = object.artist;
        var title = object.title;
        var url = object.url;
        var owner_id = object.owner_id;
        var aid = object.aid;
        var addByUserId = object.addByUserId;
        var addByUserAvatar = object.addByUserAvatar;
        var duration = object.duration;
        var lyrics_id = object.lyrics_id;
        var playing_time = null;
    }

    var getData = function(){
        return {
            url: url,
            artist: artist,
            title: title,
            url: url,
            owner_id: owner_id,
            aid: aid,
            addByUserAvatar: addByUserAvatar,
            addByUserId: addByUserId,
            duration: duration,
            lyrics_id: lyrics_id,
            playing_time: playing_time,
        }
    }

    var getDuration = function(){
        return duration;
    }

    return {
        url: url,
        artist: artist,
        title: title,
        url: url,
        owner_id: owner_id,
        aid: aid,
        addByUserAvatar: addByUserAvatar,
        addByUserId: addByUserId,
        duration: duration,
        lyrics_id: lyrics_id,
    	getUrl: function(){
    		return url;
    	},
    	getTitle: function(){
    		return title;
    	},
        getPlayingTime: function(){
            return playing_time;
        },
        setPlayingTime: function(time){
            playing_time = time;
        },
        getData: getData,
        getDuration: getDuration
    }
}

exports = module.exports = Track;
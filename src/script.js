const clientId = "1063a5e722ca4a3f935f1cbc269a363a";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    console.log(accessToken);
    const profile = await fetchProfile(accessToken);
    const topArtists = await fetchTopArtists(accessToken);
    const topTracks = await fetchTopTracks(accessToken);
    console.log(topTracks);
    populateUI(profile, topArtists, topTracks);
}

export async function redirectToAuthCodeFlow(clientId) {
    // TODO: Redirect to Spotify authorization page
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
  // TODO: Get access token for code
  const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

export async function fetchProfile(token) {
    // TODO: Call Web API
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

export async function fetchTopArtists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists?limit=5&offset=0", {
        method: "GET", headers: {Authorization: `Bearer ${token}`}
    });
    console.log(result);
    return await result.json();
}

export async function fetchTopTracks(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=5&offset=0", {
        method: "GET", headers: {Authorization: `Bearer ${token}`}
    });
    console.log(result);
    return await result.json();
}

function calc_sun_element(el, mod) {
    if (el == "fire") {
        if (mod == "cardinal") {
            return "aries"
        } else if (mod == "fixed") {
            return "leo"
        } else {
            return "sagittarius"
        }
    }
    if (el = "earth") {
        if (mod == "cardinal") {
            return "capricorn"
        } else if (mod == "fixed") {
            return "taurus"
        } else {
            return "virgo"
        }
    }
    if (el == "air") {
        if (mod == "cardinal") {
            return "libra"
        } else if (mod == "fixed") {
            return "aquarius"
        } else {
            return "gemini"
        }
    }
    if (el == "water") {
        if (mod == "cardinal") {
            return "cancer"
        } else if (mod == "fixed") {
            return "scorpio"
        } else {
            return "pisces"
        }
    }

}
function calc_element(zodiac_elements) {
    let maxKey = null
    let maxValue = -Infinity

    for (let key in zodiac_elements) {
        if (zodiac_elements[key] > maxValue) {
            maxValue = zodiac_elements[key]
            maxKey = key
        }
    }
    console.log(maxKey)
    return maxKey
}

function calc_sun(artist) {
    let modality = {cardinal: 0, fixed: 0, mutable: 0};
    let elements = {water: 0, fire: 0, air: 0, earth: 0};
    let major_element;
    let overall_element;
    let major_modality;
    let sun;
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < artist.items[i].genres.length; j++) {
            if (artist.items[i].genres[j].includes("pop")) {
                elements.water += 1
                elements.air += 1
                elements.fire += 1
                elements.earth += 1
                modality.cardinal += 1
                modality.mutable += 1
            } else if (artist.items[i].genres[j].includes("hip hop")) {
                elements.air += 1
                elements.earth += 1
                elements.fire += 1
                modality.fixed += 1
            } else if (artist.items[i].genres[j].includes("rap")) {
                elements.fire += 1
                elements.air += 1
                modality.cardinal += 1
            } else if (artist.items[i].genres[j].includes("edm")) {
                elements.water += 1
                elements.fixed += 1
                elements.fire += 1
            } else if (artist.items[i].genres[j].includes("indie")) {
                elements.water += 1
                elements.earth += 1
                elements.air += 1
                modality.fixed += 1
            } else if (artist.items[i].genres[j].includes("rock")) {
                elements.fire += 1
                elements.air += 1
                modality.cardinal += 1
            } else {
                elements.water += 1
                elements.air += 1
                modality.mutable += 1
            }
        }
        if (i == 0) {
           major_element = calc_element(elements)
        }
        
    }
    overall_element = calc_element(elements)
    major_modality = calc_element(modality)
    sun = calc_sun_element(overall_element, major_modality)
    return [major_element, sun]
}

// function trackStats(track_id) {
//     const result = fetch(`https://api.spotify.com/v1/audio-features/${track_id}`, {
//         method: "GET"
//     });
//     console.log(result);
//     return result.json();
// }

// function track_info(tracks) {
//     for (let i = 0; i < tracks.items.length; i++) {
//         console.log(tracks.items[i].id)
//         //let track_stats = trackStats(tracks.items[i].id)

//         console.log("inside track_info")
//         //console.log(track_stats)
//     }

// }

function populateUI(profile, artist, track) {
    // top artist
    var artistLine = document.getElementById("topArt");
    var artistName = document.createTextNode(artist.items[0].name);
    console.log(artist.items[0].genres)
    // element sign vibes
    var majorLine = document.getElementById("majorArt");
    var majorElement = calc_sun(artist);
    var element_vibe = document.createTextNode(majorElement[0] + " sign vibes")
    // top track
    var trackLine = document.getElementById("topTrack");
    var trackName = document.createTextNode(track.items[0].name + " by " + track.items[0].artists[0].name);
    // element sign vibes
    var majorTrackLine = document.getElementById("majorTrack");
    // var track_vibes = track_info(track)
    // sun
    var sunLine = document.getElementById("sun");
    var sunSign = document.createTextNode(majorElement[1] + " sun");
    artistLine.appendChild(artistName);
    majorLine.appendChild(element_vibe);
    trackLine.appendChild(trackName);
    sunLine.appendChild(sunSign);
}
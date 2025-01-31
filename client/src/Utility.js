import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
const cogSvcRegion = "westus2";
const cogSvcSubKey = "Dv89x4khYEbliHuTjpDGD00sItZOBHjWXuLy2Cq4XPpmIbXi6GL5JQQJ99BAAC8vTInXJ3w3AAAYACOGR7kl";
const voiceName = "en-US-AvaMultilingualNeural"
const avatarCharacte1 = "Jeff"
const avatarStyle = "formal"
const avatarBackgroundColor = "#FFFFFFFF"


export const createWebRTCConnection = (iceServerUrl, iceServerUsername, iceServerCredential) => {

    var peerConnection = new RTCPeerConnection({
        iceServers: [{
            urls: [ iceServerUrl ],
            username: iceServerUsername,
            credential: iceServerCredential
        }]
    })

    return peerConnection;

}

export const createAvatarSynthesizer = (avatarCharacter) => {

    const speechSynthesisConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion)

    speechSynthesisConfig.speechSynthesisVoiceName = avatarCharacter.avatarVoice;

    const videoFormat = new SpeechSDK.AvatarVideoFormat()

    let videoCropTopLeftX =  600
    let videoCropBottomRightX = 1320
    videoFormat.setCropRange(new SpeechSDK.Coordinate(videoCropTopLeftX, 50), new SpeechSDK.Coordinate(videoCropBottomRightX, 1080));


    const talkingAvatarCharacter = avatarCharacter.avatarName
    const talkingAvatarStyle = avatarCharacter.avatarStyle

    const avatarConfig = new SpeechSDK.AvatarConfig(talkingAvatarCharacter, talkingAvatarStyle, videoFormat)
    avatarConfig.backgroundColor = avatarBackgroundColor;
    let avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(speechSynthesisConfig, avatarConfig)

    avatarSynthesizer.avatarEventReceived = function (s, e) {
        var offsetMessage = ", offset from session start: " + e.offset / 10000 + "ms."
        if (e.offset === 0) {
            offsetMessage = ""
        }
        console.log("[" + (new Date()).toISOString() + "] Event received: " + e.description + offsetMessage)
    }

    return avatarSynthesizer;

}
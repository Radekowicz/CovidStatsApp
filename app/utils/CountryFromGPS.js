import * as Location from "expo-location";

export const getLocation = async () => {
    const {status} = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
        const locationGeo = await Location.getCurrentPositionAsync();
        const locationRevGeocode = await Location.reverseGeocodeAsync({
            latitude: locationGeo.coords.latitude,
            longitude: locationGeo.coords.longitude
        })
        return locationRevGeocode[0].country;
    } else {
        console.log('Permission not granted')
        return ''
    }
}

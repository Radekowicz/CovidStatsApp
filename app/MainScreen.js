import * as React from "react";
import {useState, useEffect} from "react";
import {StyleSheet, ScrollView, View, SafeAreaView} from "react-native";
import {Icon, ListItem, SearchBar} from "react-native-elements";
import axios from "axios";
import * as Location from 'expo-location';

const options = {
    method: "GET",
    url: "https://covid-193.p.rapidapi.com/statistics",
    headers: {
        "x-rapidapi-host": "covid-193.p.rapidapi.com",
        "x-rapidapi-key": "6c514c7313msha1e1596a4021a0cp19a383jsn4ed22f399483",
    },
};

export default function MainScreen({navigation}) {
    const [list, setList] = useState([]);
    const [searchResult, setSearchResult] = useState([]);

    const [search, setSearch] = useState('');
    const [currentCountry, setCurrentCountry] = useState('');

    useEffect(() => {
        getListRequest();
        getLocation().then(country => setCurrentCountry(country));
    }, []);

    useEffect(() => {
        updateSearch(search);
    }, [search]);

    const getLocation = async () => {
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

    const getListRequest = () => {
        axios
            .request(options)
            .then((response) => {
                const newList = response.data.response;
                setList(newList);
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    const sortList = (a, b) => {
        const sortDir = 'DESC'
        //TRUE asc Fale desc
        const direction = sortDir === 'ASC' ? 1 : -1;
        // geolocalized item always at the top
        if (a.country === currentCountry) {
            return -1;
        }
        const sortBy = 'TOTAL_DEATHS'
        switch (sortBy) {
            case 'TOTAL_CASES':
                if (b.cases.total) {
                    if (a.cases.total) {
                        return (b.cases.total > a.cases.total ? 1 : -1) * direction
                    }
                    return 1 * direction;
                } else {
                    return 0;
                }

            case 'NEW_CASES':
                if (a.cases.new && b.cases.new) {
                    // cutting off '+' sign
                    const aString = a.cases.new.substring(1);
                    const bString = b.cases.new.substring(1);
                    const aInt = parseInt(aString, 10);
                    const bInt = parseInt(bString, 10);
                    return (bInt - aInt) * direction;
                } else if (!a.cases.new) {
                    return 1 * direction
                } else if (!b.cases.new) {
                    return -1 * direction;
                } else {
                    return 0;
                }

            case 'TOTAL_DEATHS':
                if (b.deaths.total) {
                    if (a.deaths.total) {
                        return (b.deaths.total > a.deaths.total ? 1 : -1) * direction
                    }
                    return 1 * direction;
                } else {
                    return 0;
                }

            case 'NEW_DEATHS':
                if (a.deaths.new && b.deaths.new) {
                    // cutting off '+' sign
                    const aString = a.deaths.new.substring(1);
                    const bString = b.deaths.new.substring(1);
                    const aInt = parseInt(aString, 10);
                    const bInt = parseInt(bString, 10);
                    return (bInt - aInt) * direction;
                } else if (!a.deaths.new) {
                    return 1 * direction;
                } else if (!b.deaths.new) {
                    return -1 * direction;
                } else {
                    return 0;
                }

            case 'COUNTRY_NAME':
                return (a.country.localeCompare(b.country)) * direction;
            default:
                return 0;
        }
    }

    const updateSearch = (search) => {
        if (search) {
            const filteredList = list?.filter((item) =>
                item.country.toLowerCase().includes(search.toLowerCase())
            );
            setSearchResult(filteredList);
        } else setSearchResult([]);
    };

    const onListItemPress = (item) => {
        navigation.navigate("DetailsScreen", {
            country: item.country,
            cases_total: item.cases.total,
        });
    };

    return (
        <SafeAreaView>
            <SearchBar
                placeholder="Type Here..."
                onChangeText={setSearch}
                value={search}
            />
            <ScrollView>
                {(search ? searchResult : list)?.sort(sortList).map((item, index) => (
                    <ListItem
                        key={index}
                        bottomDivider
                        onPress={() => onListItemPress(item)}
                    >
                        {item.country === currentCountry ? <Icon name='gps-fixed'/> : null}
                        <ListItem.Content>
                            <ListItem.Title>{item.country}</ListItem.Title>
                            <ListItem.Subtitle>
                                Total cases: {item.cases.total}
                                New: {item.deaths.total ?? 'none'}
                            </ListItem.Subtitle>
                        </ListItem.Content>
                        <ListItem.Chevron/>
                    </ListItem>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {},
});

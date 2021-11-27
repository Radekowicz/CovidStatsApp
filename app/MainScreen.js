import * as React from "react";
import {useState, useEffect} from "react";
import {StyleSheet, ScrollView, View, SafeAreaView} from "react-native";
import {ListItem, SearchBar} from "react-native-elements";
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
        console.log('GETTING GPS DATA')
        const {status} = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const locationGeo = await Location.getCurrentPositionAsync();
            const locationRevGeocode = await Location.reverseGeocodeAsync({
                latitude: locationGeo.coords.latitude,
                longitude: locationGeo.coords.longitude
            })
            console.log(locationRevGeocode);
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
                console.log(newList[0])
                setList(newList);
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    const sortList = (a, b) => {
        if (a.country === currentCountry) {
            return 1;
        }
        if (b.cases.total) {
            if (a.cases.total) {
                return b.cases.total > a.cases.total ? 1 : -1
            }
            return 1;
        } else {
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
                        <ListItem.Content>
                            <ListItem.Title>{item.country}</ListItem.Title>
                            <ListItem.Subtitle>
                                Total cases: {item.cases.total}
                                From nav: {item.country === currentCountry ? 'yes' : 'no'}
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

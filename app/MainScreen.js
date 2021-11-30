import * as React from "react";
import {useEffect, useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import {Button, Divider, Menu, Provider, Searchbar} from 'react-native-paper';
import axios from "axios";
import {getLocation} from "./utils/CountryFromGPS";
import {Icon, ListItem} from "react-native-elements";

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

    const [sortField, setSortField] = useState('COUNTRY_NAME');
    const [sortDir, setSortDir] = useState('ASC');


    const [filterMenuVisible, setFilterMenuVisible] = useState(false);
    const openMenu = () => setFilterMenuVisible(true);
    const closeMenu = () => setFilterMenuVisible(false);


    useEffect(() => {
        getListRequest();
        getLocation().then(country => setCurrentCountry(country));
    }, []);

    useEffect(() => {
        updateSearch(search);
    }, [search]);

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

    const setSorting = (field, direction) => {
        setSortDir(direction);
        setSortField(field);
    }

    const sortList = (a, b) => {
        const direction = (sortDir === 'ASC' ? 1 : -1);
        // geolocalized item always at the top
        if (a.country === currentCountry) {
            return -1;
        }
        switch (sortField) {
            case 'TOTAL_CASES':
                if (b.cases.total) {
                    if (a.cases.total) {
                        return (b.cases.total > a.cases.total ? -1 : 1) * direction
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
                    return (aInt - bInt) * direction;
                } else if (!a.cases.new) {
                    return -1 * direction
                } else if (!b.cases.new) {
                    return 1 * direction;
                } else {
                    return 0;
                }

            case 'TOTAL_DEATHS':
                if (b.deaths.total) {
                    if (a.deaths.total) {
                        return (a.deaths.total > b.deaths.total ? 1 : -1) * direction
                    }
                    return -1 * direction;
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
                    return (aInt - bInt) * direction;
                } else if (!a.deaths.new) {
                    return -1 * direction;
                } else if (!b.deaths.new) {
                    return 1 * direction;
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
        <Provider>
            <SafeAreaView>
                <View style={{
                    position: 'relative',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignContent: 'stretch',
                    alignItems: 'stretch',
                    borderBottomWidth: 1,
                    borderColor: 'lightblue',

                }}>
                    <Searchbar style={{
                        width: '80%',
                        height: 50,
                    }}
                               placeholder="Type Here..."
                               onChangeText={setSearch}
                               value={search}
                    />

                    <View
                        style={{
                            position: 'relative',
                            width: '20%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                        <Menu
                            visible={filterMenuVisible}
                            onDismiss={closeMenu}
                            anchor={
                                <Button
                                    style={{
                                        width: '100%',
                                        padding: 0,
                                        margin: 0,
                                        height: 50,
                                    }}
                                    contentStyle={{
                                        height: '100%',
                                        width: '100%'
                                    }}
                                    color='lightblue'
                                    mode="contained" onPress={openMenu}>
                                    <Icon size='36' name='sort'/>
                                </Button>
                            }>
                            <Menu.Item onPress={() => {
                                setSorting('COUNTRY_NAME', 'ASC');
                                closeMenu();
                            }} title="Country name ascending"/>
                            <Menu.Item onPress={() => {
                                setSorting('COUNTRY_NAME', 'DESC');
                                closeMenu();
                            }} title="Country name descending"/>
                            <Divider/>
                            <Menu.Item onPress={() => {
                                setSorting('TOTAL_CASES', 'ASC');
                                closeMenu();
                            }} title="Total cases ascending"/>
                            <Menu.Item onPress={() => {
                                setSorting('TOTAL_CASES', 'DESC');
                                closeMenu();
                            }} title="Total cases descending"/>
                            <Divider/>
                            <Menu.Item onPress={() => {
                                setSorting('NEW_CASES', 'ASC');
                                closeMenu();
                            }} title="New cases ascending"/>
                            <Menu.Item onPress={() => {
                                setSorting('NEW_CASES', 'DESC');
                                closeMenu();
                            }} title="New cases descending"/>
                            <Divider/>
                            <Menu.Item onPress={() => {
                                setSorting('TOTAL_DEATHS', 'ASC');
                                closeMenu();
                            }} title="Total deaths ascending"/>
                            <Menu.Item onPress={() => {
                                setSorting('TOTAL_DEATHS', 'DESC');
                                closeMenu();
                            }} title="Total deaths descending"/>
                            <Divider/>
                            <Menu.Item onPress={() => {
                                setSorting('NEW_DEATHS', 'ASC');
                                closeMenu();
                            }} title="New deaths ascending"/>
                            <Menu.Item onPress={() => {
                                setSorting('NEW_DEATHS', 'DESC');
                                closeMenu();
                            }} title="New deaths descending"/>

                        </Menu>
                    </View>
                </View>
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
                                    New cases: {item.cases.new ?? 'none'}
                                    Total dead: {item.deaths.total}
                                    New ded: {item.deaths.new ?? 'none'}
                                </ListItem.Subtitle>
                            </ListItem.Content>
                            <ListItem.Chevron/>
                        </ListItem>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {},
});

import * as React from "react";
import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, SafeAreaView } from "react-native";
import { ListItem, SearchBar } from "react-native-elements";
import axios from "axios";

const options = {
  method: "GET",
  url: "https://covid-193.p.rapidapi.com/statistics",
  headers: {
    "x-rapidapi-host": "covid-193.p.rapidapi.com",
    "x-rapidapi-key": "6c514c7313msha1e1596a4021a0cp19a383jsn4ed22f399483",
  },
};

export default function MainScreen({ navigation }) {
  const [list, setList] = useState([]);
  const [searchResult, setSearchResult] = useState([]);

  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .request(options)
      .then((response) => {
        const newList = response.data.response;
        newList.sort((a, b) => b.cases.total - a.cases.total);
        setList(newList);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  const updateSearch = (search) => {
    setSearch(search);

    if (search) {
      const filteredList = list?.filter((item) =>
        item.country.toLocaleLowerCase().includes(search.toLocaleLowerCase())
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
        onChangeText={updateSearch}
        value={search}
      />
      <ScrollView>
        {(search ? searchResult : list)?.map((item, index) => (
          <ListItem
            key={index}
            bottomDivider
            onPress={() => onListItemPress(item)}
          >
            <ListItem.Content>
              <ListItem.Title>{item.country}</ListItem.Title>
              <ListItem.Subtitle>
                Total cases: {item.cases.total}
              </ListItem.Subtitle>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {},
});

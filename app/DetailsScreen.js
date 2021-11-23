import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Card, Text } from "react-native-elements";
import axios from "axios";

const options = (country) => {
  return {
    method: "GET",
    url: `https://covid-193.p.rapidapi.com/statistics?country=${country}`,
    headers: {
      "x-rapidapi-host": "covid-193.p.rapidapi.com",
      "x-rapidapi-key": "6c514c7313msha1e1596a4021a0cp19a383jsn4ed22f399483",
    },
  };
};

function Box({ title, data }) {
  return (
    <View style={styles.box}>
      <Card>
        <Card.Title>{title}</Card.Title>
        <Card.Divider />
        <Card.Title>{data}</Card.Title>
      </Card>
    </View>
  );
}

export default function DetailsScreen({ route, navigation }) {
  const { country } = route.params;
  const [data, setData] = useState();

  useEffect(() => {
    axios
      .request(options(country))
      .then((response) => {
        setData(response.data.response[0]);
        console.log(response.data.response[0]);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  return (
    <SafeAreaView>
      <Text h2>{data?.country}</Text>
      <View style={styles.container}>
        <Box title="New cases today" data={data?.cases.new} />
        <Box title="Total cases" data={data?.cases.total} />
      </View>
      <View style={styles.container}>
        <Box title="New deaths today" data={data?.deaths.new} />
        <Box title="Total deaths" data={data?.deaths.total} />
      </View>
      <View style={styles.container}>
        <Box title="Active cases" data={data?.cases.active} />
        <Box title="Recovered" data={data?.cases.recovered} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: Dimensions.get("window").width / 2,
  },
});

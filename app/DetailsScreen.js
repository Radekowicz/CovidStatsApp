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
import { LineChart } from "react-native-chart-kit";
import dayjs from "dayjs";

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

const historyOptions = (country, date) => {
  const formatedDate = date.format("YYYY-MM-DD");

  return {
    method: "GET",
    url: `https://covid-193.p.rapidapi.com/history?country=${country}&day=${formatedDate}`,
    headers: {
      "x-rapidapi-host": "covid-193.p.rapidapi.com",
      "x-rapidapi-key": "6c514c7313msha1e1596a4021a0cp19a383jsn4ed22f399483",
    },
  };
};

function Box({ title, data }) {
  return (
    <View style={styles.box}>
      <Card.Title style={{ fontSize: 18 }}>{title}</Card.Title>
      <Card.Divider />
      <Card.Title>{data ? data : "N/A"}</Card.Title>
    </View>
  );
}

export default function DetailsScreen({ route, navigation }) {
  const { country } = route.params;
  const [data, setData] = useState();

  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState(["", "", "", "", "", "", ""]);

  useEffect(() => {
    try {
      getCountryRequest();
      getDataFromPastMonth();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getCountryRequest = () => {
    axios
      .request(options(country))
      .then((response) => {
        setData(response.data.response[0]);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const getHistoryRequest = async (country, date) => {
    try {
      const response = await axios.request(historyOptions(country, date));
      return response.data.response[0];
    } catch (error) {
      console.error(error);
    }
  };

  const getDataFromPastMonth = async () => {
    const array = [];
    let iterations = 0;
    let day = 0;
    while (iterations < 7) {
      if (day > 20) break;
      const response = await getHistoryRequest(
        country,
        dayjs().subtract(day, "day")
      );
      day++;

      if (response !== undefined) {
        array.unshift(response);
        iterations++;
      }
    }

    setChartLabels(getLabels(array));
    setChartData(getData(array));
  };

  const getLabels = (array) =>
    array?.map((item, index) => {
      if (index === 0 || index === 3 || index === 6) return item?.day;
      return "";
    });

  const getData = (array) =>
    array?.map((item) => parseInt(item?.cases.active) / 1000);

  return (
    <SafeAreaView style={styles.saveView}>
      <Text style={styles.title} h2>
        {data?.country}
      </Text>

      <LineChart
        data={{
          labels: chartLabels,
          datasets: [
            {
              data: chartData,
            },
          ],
        }}
        width={Dimensions.get("window").width}
        height={220}
        yAxisSuffix="k"
        chartConfig={{
          backgroundColor: "#00a2d6",
          backgroundGradientFrom: "#00c1ff",
          backgroundGradientTo: "#41cefa",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#41cefa",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <View style={styles.container}>
        <Box title="New cases" data={data?.cases.new} />
        <Box title="Total cases" data={data?.cases.total} />
      </View>
      <View style={styles.container}>
        <Box title="New deaths" data={data?.deaths.new} />
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
  saveView: {},
  title: { padding: 10, color: "#2e2e2e", fontWeight: "600" },
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: Dimensions.get("window").width / 2 - 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "grey",
    margin: 10,
    padding: 10,
  },
  chart: {},
});

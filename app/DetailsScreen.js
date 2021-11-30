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

  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  useEffect(() => {
    getCountryRequest();
    getDataFromPastMonth();
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
    for (let i = 6; i >= 0; i--) {
      const response = await getHistoryRequest(
        country,
        dayjs().subtract(i, "day")
      );
      array.push(response);
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
        width={Dimensions.get("window").width} // from react-native
        height={220}
        yAxisSuffix="k"
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
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
  saveView: {},
  title: { padding: 10 },
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    width: Dimensions.get("window").width / 2,
  },
  chart: {},
});

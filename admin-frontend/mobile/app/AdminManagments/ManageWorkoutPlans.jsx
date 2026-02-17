import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ApiClient from "../../utils/ApiClient";

import chestWorkout from "../../assets/images/workoutBgImages/Chest.jpeg";
import backWorkout from "../../assets/images/workoutBgImages/Back.jpeg";
import shoulderWorkout from "../../assets/images/workoutBgImages/Shoulder.jpeg";
import armsWorkout from "../../assets/images/workoutBgImages/Arms.jpeg";
import absWorkout from "../../assets/images/workoutBgImages/Abs.jpeg";

import calfWorkout from "../../assets/images/workoutBgImages/Calf.jpeg";
import quadWorkout from "../../assets/images/workoutBgImages/Quad.jpeg";
import gluteHamstringWorkout from "../../assets/images/workoutBgImages/GluteHamstring.jpeg";

const ManageWorkoutPlans = () => {
  const router = useRouter();
  const workoutRoute = {
    upperBody: [
      {
        title: "Chest Workout",
        bgImage: chestWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Chest",
            // workoutData: JSON.stringify(workoutData?.Chest || []),
          },
        },
      },
      {
        title: "Back Workout",
        bgImage: backWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Back",
            // workoutData: JSON.stringify(workoutData?.Back || []),
          },
        },
      },
      {
        title: "Shoulder Workout",
        bgImage: shoulderWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Shoulder",
            // workoutData: JSON.stringify(workoutData?.Shoulder || []),
          },
        },
      },
      {
        title: "Arm Workout",
        bgImage: armsWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Arm",
            // workoutData: JSON.stringify(workoutData?.Arm || []),
          },
        },
      },
      {
        title: "Abs Workout",
        bgImage: absWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Abs",
            // workoutData: JSON.stringify(workoutData?.Abs || []),
          },
        },
      },
    ],
    lowerBody: [
      {
        title: "Calf Workout",
        bgImage: calfWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Calf",
            // workoutData: JSON.stringify(workoutData?.Calf || []),
          },
        },
      },
      {
        title: "Quad Workout",
        bgImage: quadWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Quad",
            // workoutData: JSON.stringify(workoutData?.Quad || []),
          },
        },
      },
      {
        title: "Glute & Hamstring Workout",
        bgImage: gluteHamstringWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Glute & Hamstring",
            // workoutData: JSON.stringify(workoutData?.GluteHamstring || []),
          },
        },
      },
    ],
  };

  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Manage Workout Plans
          </Text>
        </View>
        <View className="flex-1 my-6">
          <View className="flex-1">
            <Text className="text-white px-5 text-[30px] font-jura-bold">
              Upper Body
            </Text>
            <ScrollView className="flex-1 border-[2px] px-2 py-1 border-[#7E7676] rounded-2xl mx-3 ">
              {workoutRoute.upperBody.map((item) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={item.title}
                  className="h-[135px] my-1 w-full rounded-2xl overflow-hidden"
                  onPress={() => router.push(item.link)}
                >
                  <ImageBackground
                    source={item.bgImage}
                    resizeMode="cover"
                    className="h-full w-full justify-center items-center"
                  >
                    <Text className="text-white text-[35px] font-jura-bold">
                      {item.title}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className="flex-1">
            <Text className="text-white px-5 text-[30px] font-jura-bold">
              Lower Body
            </Text>
            <ScrollView className="flex-1 border-[2px] px-2 py-1 border-[#7E7676] rounded-2xl mx-3 ">
              {workoutRoute.lowerBody.map((item) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={item.title}
                  className="h-[135px] my-1 w-full rounded-2xl overflow-hidden"
                  onPress={() => router.push(item.link)}
                >
                  <ImageBackground
                    source={item.bgImage}
                    resizeMode="cover"
                    className="h-full w-full justify-center items-center"
                  >
                    <Text className="text-white text-[35px] font-jura-bold text-center">
                      {item.title}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </AppGradient>
  );
};

export default ManageWorkoutPlans;

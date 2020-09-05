import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
	apiKey: "AIzaSyBXUtJCWovaLjnKoxPZtbbCLZzqgKzoWnQ",
	authDomain: "birthday-e8251.firebaseapp.com",
	databaseURL: "https://birthday-e8251.firebaseio.com",
	projectId: "birthday-e8251",
	storageBucket: "birthday-e8251.appspot.com",
	messagingSenderId: "1045134097896",
	appId: "1:1045134097896:web:4613455eaac0785141b85d",
	measurementId: "G-RN8CS1ZJTG",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
firebase.database();
firebase.storage();

export default firebase;

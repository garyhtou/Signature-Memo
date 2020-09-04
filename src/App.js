import React from "react";
import "./App.css";
import firebase from "./firebase";
import { Helmet } from "react-helmet";
import {
	Spin,
	Layout,
	Avatar,
	List,
	Form,
	Input,
	Upload,
	message,
	Button,
} from "antd";
import {
	GithubOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import showdown from "showdown";
import FbImageLibrary from "react-fb-image-grid";

class App extends React.Component {
	constructor() {
		super();

		this.state = {
			home: window.location.pathname.split("/")[1] === "",
			page: window.location.pathname.split("/")[1],
			add:
				String(window.location.pathname.split("/")[2]).toLowerCase() === "add",
			error: false,
			loading: true,
			messages: {},
			name: "",
			description: "",
			addProfileLoading: false,
			addPhotos: [],
			messageSubmited: false,
		};

		showdown.setFlavor("github");
		showdown.setOption("simpleLineBreaks", true);
	}

	showdownConverter = new showdown.Converter();

	componentDidMount() {
		if (!this.state.home) {
			this.fbListener = firebase
				.database()
				.ref("person/" + this.state.page)
				.on(
					"value",
					function (snapshot) {
						if (snapshot.exists()) {
							this.setState({
								name: snapshot.val().name,
								description: snapshot.val().description,
								messages: snapshot.val().messages,
								loading: false,
							});
						} else {
							this.setState({ error: true, loading: false });
						}
					}.bind(this)
				);
		} else {
			this.setState({ loading: false });
		}
	}

	componentWillUnmount() {
		this.fbListener && this.fbListener();
		this.fbListener = undefined;
	}

	getBase64(img, callback) {
		const reader = new FileReader();
		reader.addEventListener("load", () => callback(reader.result));
		reader.readAsDataURL(img);
	}

	render() {
		return (
			<div className="App">
				<Helmet>
					<title>Happy Birthday!</title>
				</Helmet>
				{this.state.home ? (
					<h1>home</h1>
				) : (
					<>
						{this.state.loading ? (
							<>
								<div style={{ minHeight: "100vh", position: "relative" }}>
									<div
										style={{
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: "translate(-50%, -50%)",
										}}
									>
										<Spin size="large" tip={<p>Loading...</p>} />
									</div>
								</div>
							</>
						) : (
							<>
								{this.state.error ? (
									<>
										<Helmet>
											<title>
												{this.state.name === ""
													? "Happy Birthday!"
													: "Happy Birthday " + this.state.name + "!"}
											</title>
										</Helmet>
										<h1>error</h1>
									</>
								) : (
									<>
										<Helmet>
											<title>
												{this.state.name === ""
													? "Happy Birthday!"
													: "Happy Birthday " + this.state.name + "!"}
											</title>
										</Helmet>
										<Layout style={{ minHeight: "100vh" }} className="person">
											<Layout.Content className="person-wrapper background">
												<h1 className="person-name">
													Happy Birthday, {this.state.name}!
												</h1>
												<h3 className="person-description">
													{this.state.description}
												</h3>
												{this.state.add ? (
													<>
														{!this.state.messageSubmited ? (
															<div className="person-add-wrapper">
																<div className="person-add-container">
																	<Form
																		hideRequiredMark
																		className="person-add-form"
																		layout="vertical"
																		onFinish={function (values) {
																			values.photo =
																				typeof this.state.addProfileURL !==
																				"undefined"
																					? this.state.addProfileURL
																					: "";
																			values.images =
																				this.state.addPhotos.length > 0
																					? this.state.addPhotos
																					: null;
																			console.log(values);

																			var error = false;
																			if (
																				typeof values.name === "undefined" ||
																				values.name === ""
																			) {
																				this.setState({
																					nameHelp:
																						"Im pretty sure you have a name!",
																					nameValidate: "error",
																					nameFeedback: true,
																				});
																				error = true;
																			} else {
																				this.setState({
																					nameHelp: null,
																					nameValidate: null,
																					nameFeedback: false,
																				});
																			}
																			if (
																				typeof values.message === "undefined" ||
																				values.message === ""
																			) {
																				this.setState({
																					messageHelp:
																						"What?! Aren't you going to say at least something?",
																					messageValidate: "error",
																					messageFeedback: true,
																				});
																				error = true;
																			} else {
																				this.setState({
																					messageHelp: null,
																					messageValidate: null,
																					messageFeedback: false,
																				});
																			}

																			if (!error) {
																				firebase
																					.database()
																					.ref(
																						"person/" +
																							window.location.pathname.split(
																								"/"
																							)[1] +
																							"/messages"
																					)
																					.push(values)
																					.then(
																						function () {
																							this.setState({
																								messageSubmited: true,
																							});
																						}.bind(this)
																					);
																			}
																		}.bind(this)}
																	>
																		<Form.Item>
																			<h1>
																				Share your message with{" "}
																				{this.state.name}
																			</h1>
																		</Form.Item>
																		<Form.Item
																			label="Your name"
																			name="name"
																			help={this.state.nameHelp}
																			validateStatus={this.state.nameValidate}
																			hasFeedback={this.state.nameFeedback}
																		>
																			<Input placeholder="Bill" />
																		</Form.Item>
																		<Form.Item
																			label="Your message"
																			required
																			name="message"
																			help={this.state.messageHelp}
																			validateStatus={
																				this.state.messageValidate
																			}
																			hasFeedback={this.state.messageFeedback}
																		>
																			<Input.TextArea rows={5} />
																		</Form.Item>
																		<Form.Item
																			label="A picture of you!"
																			name="photo"
																		>
																			<Upload
																				name="avatar"
																				listType="picture-card"
																				className="avatar-uploader"
																				showUploadList={false}
																				customRequest={function (upload) {
																					console.log(upload);
																					this.setState({
																						addProfileLoading: true,
																					});
																					const path =
																						window.location.pathname.split(
																							"/"
																						)[1] +
																						"/" +
																						Date.now() +
																						"_" +
																						upload.file.uid +
																						"_" +
																						upload.file.name;
																					firebase
																						.storage()
																						.ref(path)
																						.put(upload.file)
																						.then(
																							function (snapshot) {
																								snapshot.ref
																									.getDownloadURL()
																									.then(
																										function (downloadURL) {
																											this.setState({
																												addProfileURL: downloadURL,
																												addProfileLoading: false,
																											});
																											message.success(
																												upload.file.name +
																													" uploaded successfully"
																											);
																											console.log(
																												"File available at",
																												downloadURL
																											);
																										}.bind(this)
																									);
																							}.bind(this)
																						)
																						.catch(function (error) {
																							message.error(
																								upload.file.name +
																									" upload failed.\n" +
																									error.message
																							);
																						});
																				}.bind(this)}
																			>
																				{this.state.addProfileURL ? (
																					<img
																						src={this.state.addProfileURL}
																						alt="avatar"
																						style={{ width: "100%" }}
																					/>
																				) : (
																					<div>
																						{this.state.addProfileLoading ? (
																							<LoadingOutlined />
																						) : (
																							<PlusOutlined />
																						)}
																						<div style={{ marginTop: 8 }}>
																							Upload
																						</div>
																					</div>
																				)}
																			</Upload>
																		</Form.Item>
																		<Form.Item
																			label="Any other pictures/memories"
																			name="images"
																		>
																			<Upload.Dragger
																				name="avatar"
																				listType="picture-card"
																				className="avatar-uploader"
																				multiple={true}
																				customRequest={function ({
																					onSuccess,
																					onError,
																					file,
																				}) {
																					console.log(file);
																					const path =
																						window.location.pathname.split(
																							"/"
																						)[1] +
																						"/" +
																						Date.now() +
																						"_" +
																						file.uid +
																						"_" +
																						file.name;
																					firebase
																						.storage()
																						.ref(path)
																						.put(file)
																						.then(
																							function (snapshot) {
																								snapshot.ref
																									.getDownloadURL()
																									.then(
																										function (downloadURL) {
																											var newAddPhotos = this.state.addPhotos.concat(
																												downloadURL
																											);
																											this.setState({
																												addPhotos: newAddPhotos,
																											});
																											message.success(
																												file.name +
																													" uploaded successfully"
																											);
																											console.log(
																												"File available at",
																												downloadURL
																											);
																											onSuccess(downloadURL);
																										}.bind(this)
																									);
																							}.bind(this)
																						)
																						.catch(function (error) {
																							message.error(
																								file.name +
																									" upload failed.\n" +
																									error.message
																							);
																							onError(error.message);
																						});
																				}.bind(this)}
																				onChange={({ newAddPhotos }) =>
																					this.setState({ newAddPhotos })
																				}
																			>
																				<div>
																					<PlusOutlined />
																					<div style={{ margin: "8px 0" }}>
																						Fill your message with special
																						memories!
																					</div>
																				</div>
																			</Upload.Dragger>
																		</Form.Item>
																		<Form.Item>
																			<Button type="primary" htmlType="submit">
																				Submit!
																			</Button>
																		</Form.Item>
																	</Form>
																</div>
															</div>
														) : (
															<></>
														)}
													</>
												) : (
													<></>
												)}
												<div className="person-messages">
													<List
														grid={{
															gutter: 20,
															xs: 1,
															sm: 1,
															md: 1,
															lg: 1,
															xl: 2,
															xxl: 2,
														}}
														dataSource={Object.keys(
															this.state.messages
														).reverse()}
														renderItem={(pushKey) => (
															<List.Item>
																<section
																	className="person-message"
																	key={pushKey}
																>
																	{/* <pre>{this.state.messages[pushKey].message}</pre> */}
																	<div className="person-message-content">
																		<div
																			className="person-message-content-text"
																			dangerouslySetInnerHTML={{
																				__html: this.showdownConverter.makeHtml(
																					this.state.messages[pushKey].message
																				),
																			}}
																		/>
																		<div className="person-message-content-images">
																			<FbImageLibrary
																				images={
																					this.state.messages[pushKey].images
																				}
																			/>
																		</div>
																	</div>
																	<footer
																		style={{
																			display: "flex",
																			alignItems: "center",
																		}}
																	>
																		<Avatar
																			className="person-message-avatar"
																			src={
																				typeof this.state.messages[pushKey]
																					.photo !== "undefined" &&
																				this.state.messages[pushKey].photo !==
																					""
																					? this.state.messages[pushKey].photo
																					: "https://www.gravatar.com/avatar/?d=mp"
																			}
																		/>
																		<span className="person-message-senderName">
																			{this.state.messages[pushKey].name}
																		</span>
																	</footer>
																</section>
															</List.Item>
														)}
													/>

													{/* {Object.keys(this.state.messages).map((pushKey) => (
														<section className="person-message" key={pushKey}>
															<div className="person-message-content">
																<div
																	className="person-message-content-text"
																	dangerouslySetInnerHTML={{
																		__html: this.showdownConverter.makeHtml(
																			this.state.messages[pushKey].message
																		),
																	}}
																/>
																<div className="person-message-content-images">
																	<FbImageLibrary
																		images={this.state.messages[pushKey].images}
																	/>
																</div>
															</div>
															<footer
																style={{
																	display: "flex",
																	alignItems: "center",
																}}
															>
																<Avatar
																	className="person-message-avatar"
																	src={
																		typeof this.state.messages[pushKey]
																			.photo !== "undefined" &&
																		this.state.messages[pushKey].photo !== ""
																			? this.state.messages[pushKey].photo
																			: "https://www.gravatar.com/avatar/?d=mp"
																	}
																/>
																<span className="person-message-senderName">
																	{this.state.messages[pushKey].name}
																</span>
															</footer>
														</section>
													))} */}
												</div>
											</Layout.Content>
											<Layout.Footer
												style={{ textAlign: "center" }}
												className="background"
											>
												<a
													className="gh-link"
													href="https://github.com/garytou2/Birthday"
													onClick={function () {
														firebase.analytics().logEvent("visit_github_repo", {
															user: window.location.pathname.split("/")[1],
														});
													}}
												>
													Birthday <GithubOutlined />
												</a>
												<span className="credit-sep">|</span>
												Developed by{" "}
												<a
													href="https://garytou.com"
													onClick={function () {
														firebase.analytics().logEvent("visit_garytou_com", {
															user: window.location.pathname.split("/")[1],
														});
													}}
												>
													Gary Tou
												</a>
											</Layout.Footer>
										</Layout>
									</>
								)}
							</>
						)}
					</>
				)}
			</div>
		);
	}
}

export default App;

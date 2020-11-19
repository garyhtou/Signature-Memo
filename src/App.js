import React from "react";
import "./App.css";
import firebase from "./firebase";
import { Helmet } from "react-helmet";
import {
	Spin,
	Layout,
	Avatar,
	Form,
	Input,
	Upload,
	message,
	Button,
	Tooltip,
} from "antd";
import {
	GithubOutlined,
	LoadingOutlined,
	PlusOutlined,
} from "@ant-design/icons";
import showdown from "showdown";
import FbImageLibrary from "react-fb-image-grid";
import Masonry from "react-masonry-css";

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
			submitLoading: false,
			type: "",
			title: "",
		};

		showdown.setFlavor("github");
		showdown.setOption("simpleLineBreaks", true);
	}

	uploading = [];

	showdownConverter = new showdown.Converter();

	componentDidMount() {
		if (!this.state.home) {
			this.fbListener = firebase
				.database()
				.ref("person/" + this.state.page)
				.on(
					"value",
					function (snapshot) {
						console.log(snapshot.val());
						if (snapshot.exists()) {
							var messages =
								typeof snapshot.val().messages !== "undefined"
									? snapshot.val().messages
									: {};
							var title =
								(snapshot.val().type === "birthday"
									? "Happy Birthday"
									: snapshot.val().type === "thankyou"
									? "Thank You"
									: "") +
								(snapshot.val().name === ""
									? "!"
									: ", " + snapshot.val().name + "!");

							this.setState({
								name: snapshot.val().name,
								description: snapshot.val().description,
								messages,
								type: snapshot.val().type,
								title,
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

	allowedFiles = ["image/jpg", "image/jpeg", "image/png"];

	render() {
		return (
			<div className="App">
				<Helmet>
					<title>Signature Memo!</title>
					<link
						rel="stylesheet"
						href={"/personCSS/" + this.state.page + ".css"}
					/>
				</Helmet>
				{this.state.home ? (
					<Layout style={{ minHeight: "100vh" }}>
						<Layout.Content style={{ textAlign: "center" }}>
							<div style={{ margin: "5vw" }}>
								<h1 style={{ fontSize: "6em" }}>
									Signature Memo{" "}
									<span role="img" aria-label="Birthday Cupcake">
										🧁
									</span>
								</h1>
								<h1>
									A website to collectively sign a virtual card, whether it's
									for an upcoming birthday or just to say thank you!
								</h1>
							</div>
							<div style={{ margin: "5vw" }}>
								<a
									href="https://github.com/garytou2/Signature-Memo"
									style={{ fontSize: "2em" }}
								>
									Check out on GitHub <GithubOutlined />
								</a>
							</div>
						</Layout.Content>
						<Layout.Footer style={{ textAlign: "center" }}>
							<a
								className="gh-link"
								href="https://github.com/garytou2/Signature-Memo"
							>
								Signature Memo <GithubOutlined />
							</a>
							<span className="credit-sep">|</span>
							Developed by <a href="https://garytou.com">Gary Tou</a>
						</Layout.Footer>
					</Layout>
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
											<title>Signature Memo - 404</title>
										</Helmet>
										<div
											style={{
												position: "absolute",
												top: "50%",
												left: "50%",
												transform: "translate(-50%, -50%)",
												textAlign: "center",
											}}
										>
											<div className="error-flex">
												<div>
													<h1 style={{ fontSize: "4em" }}>Whoops!</h1>
													<div style={{ fontSize: "1.1em" }}>
														<p>
															<code>
																{window.location.pathname.split("/")[1]}
															</code>{" "}
															doesn't exists.
														</p>
													</div>
												</div>
											</div>
										</div>
									</>
								) : (
									<>
										<Helmet>
											<title>{this.state.title}</title>
										</Helmet>
										<Layout
											style={{ minHeight: "100vh" }}
											className="person background"
										>
											<Layout.Content className="person-wrapper">
												<h1 className="person-name">{this.state.title}</h1>
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
																			this.setState({ submitLoading: true });
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

																			const addToFB = function () {
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
																								submitLoading: false,
																							});
																						}.bind(this)
																					)
																					.catch(
																						function (error) {
																							message.error(
																								"Error:\n" + error.message
																							);
																							this.setState({
																								submitLoading: false,
																							});
																						}.bind(this)
																					);
																			}.bind(this);

																			if (!error) {
																				if (this.uploading.length > 0) {
																					message.info(
																						"It'll take a sec. Files are still uploading!"
																					);
																					var checker = setInterval(
																						function () {
																							console.log("checking");
																							if (this.uploading.length === 0) {
																								clearInterval(checker);
																								addToFB();
																							}
																						}.bind(this),
																						100
																					);
																				} else {
																					addToFB();
																				}
																			} else {
																				this.setState({
																					submitLoading: false,
																				});
																			}
																		}.bind(this)}
																	>
																		<Form.Item>
																			<h1>
																				Share a message with {this.state.name}
																			</h1>
																		</Form.Item>
																		<Form.Item
																			label="Your name"
																			name="name"
																			help={this.state.nameHelp}
																			validateStatus={this.state.nameValidate}
																			hasFeedback={this.state.nameFeedback}
																		>
																			<Input
																				placeholder="Bill"
																				className="person-add-message-input"
																			/>
																		</Form.Item>
																		<div className="person-add-messageWrapper">
																			<Form.Item
																				label="Your message"
																				required
																				name="message"
																				help={this.state.messageHelp}
																				validateStatus={
																					this.state.messageValidate
																				}
																				hasFeedback={this.state.messageFeedback}
																				className="person-add-message-formItem"
																			>
																				<Input.TextArea
																					rows={5}
																					className="person-add-message-input"
																					style={{ resize: "none" }}
																					placeholder={
																						"Yo " + this.state.name + "!"
																					}
																				></Input.TextArea>
																			</Form.Item>
																			<Tooltip
																				title={
																					<p>
																						<a
																							href="https://www.markdownguide.org/getting-started/"
																							style={{ color: "inherit" }}
																						>
																							Markdown supported
																						</a>
																					</p>
																				}
																			>
																				<img
																					src="/markdown.svg"
																					className="person-add-message-mdIcon"
																				/>
																			</Tooltip>
																		</div>
																		<Form.Item
																			label="A picture of you!"
																			name="photo"
																		>
																			<Upload
																				name="avatar"
																				listType="picture-card"
																				className="avatar-uploader"
																				showUploadList={false}
																				customRequest={function ({
																					onSuccess,
																					onError,
																					file,
																				}) {
																					console.log(file);
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
																						file.uid +
																						"_" +
																						file.name;

																					this.uploading.push(path);

																					if (
																						this.allowedFiles.includes(
																							file.type
																						)
																					) {
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
																												this.setState({
																													addProfileURL: downloadURL,
																													addProfileLoading: false,
																												});
																												message.success(
																													file.name +
																														" uploaded successfully"
																												);
																												const index = this.uploading.indexOf(
																													path
																												);
																												if (index !== -1) {
																													this.uploading.splice(
																														index,
																														1
																													);
																												}
																												console.log(
																													"File available at",
																													downloadURL
																												);
																												onSuccess(downloadURL);
																											}.bind(this)
																										);
																								}.bind(this)
																							)
																							.catch(
																								function (error) {
																									this.setState({
																										addProfileLoading: false,
																									});
																									message.error(
																										"Error:\n" + error.message
																									);
																									onError(
																										"Error:\n" + error.message
																									);
																									const index = this.uploading.indexOf(
																										path
																									);
																									if (index !== -1) {
																										this.uploading.splice(
																											index,
																											1
																										);
																									}
																								}.bind(this)
																							);
																					} else {
																						this.setState({
																							addProfileLoading: false,
																						});
																						message.error(
																							"You can only upload jpg/jpeg/png."
																						);
																						onError(
																							"You can only upload jpg/jpeg/png."
																						);
																						const index = this.uploading.indexOf(
																							path
																						);
																						if (index !== -1) {
																							this.uploading.splice(index, 1);
																						}
																					}
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

																					this.uploading.push(path);

																					if (
																						this.allowedFiles.includes(
																							file.type
																						)
																					) {
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
																												const index = this.uploading.indexOf(
																													path
																												);
																												if (index !== -1) {
																													this.uploading.splice(
																														index,
																														1
																													);
																												}
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
																							.catch(
																								function (error) {
																									message.error(
																										file.name +
																											" upload failed.\n" +
																											error.message
																									);
																									const index = this.uploading.indexOf(
																										path
																									);
																									if (index !== -1) {
																										this.uploading.splice(
																											index,
																											1
																										);
																									}
																									onError(
																										file.name +
																											" upload failed.\n" +
																											error.message
																									);
																								}.bind(this)
																							);
																					} else {
																						message.error(
																							"You can only upload jpg/jpeg/png."
																						);
																						onError(
																							"You can only upload jpg/jpeg/png."
																						);
																						const index = this.uploading.indexOf(
																							path
																						);
																						if (index !== -1) {
																							this.uploading.splice(index, 1);
																						}
																					}
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
																			<Button
																				type="primary"
																				htmlType="submit"
																				loading={this.state.submitLoading}
																			>
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
													{Object.keys(this.state.messages).length === 0 ? (
														<section className="person-message">
															<div className="person-message-content">
																<div className="person-message-content-text" />
																<p>
																	<strong>No messages yet!</strong>
																</p>
																<p>
																	Visit{" "}
																	<a
																		href={
																			window.location.protocol +
																			"//" +
																			window.location.hostname +
																			(window.location.port
																				? ":" + window.location.port
																				: "") +
																			"/" +
																			window.location.pathname.split("/")[1] +
																			"/" +
																			"add"
																		}
																	>
																		<code>
																			{window.location.protocol +
																				"//" +
																				window.location.hostname +
																				(window.location.port
																					? ":" + window.location.port
																					: "") +
																				"/" +
																				window.location.pathname.split("/")[1] +
																				"/" +
																				"add"}
																		</code>
																	</a>{" "}
																	to add your message here!
																</p>
															</div>
														</section>
													) : (
														<Masonry
															breakpointCols={
																Object.keys(this.state.messages).length < 4
																	? { default: 1 }
																	: {
																			default: 2,
																			1000: 1,
																	  }
															}
															className="person-messages-masonry-grid"
															columnClassName="person-messages-masonry-grid_column"
														>
															{Object.keys(this.state.messages)
																.reverse()
																.map((pushKey) => (
																	<section
																		className="person-message"
																		key={pushKey}
																	>
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
																					renderOverlay={() => (
																						<span>Show Image</span>
																					)}
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
																))}
														</Masonry>
													)}
												</div>
											</Layout.Content>
											<Layout.Footer style={{ textAlign: "center" }}>
												<a
													className="gh-link"
													href="https://github.com/garytou2/Signature-Memo"
												>
													Signature Memo <GithubOutlined />
												</a>
												<span className="credit-sep">|</span>
												Developed by <a href="https://garytou.com">Gary Tou</a>
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

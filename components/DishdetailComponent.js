import React, {Component} from 'react';
import {View,Text,ScrollView,FlatList,Modal,StyleSheet,Button,PanResponder,Alert, Share} from 'react-native';
import {Card, Icon, Rating, Input} from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';
import { postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (comment) => dispatch(postComment(comment))
})

function RenderDish (props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }

    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
        return (dx > 200);
    };

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        },{
            dialogTitle: 'Share ' + title
        })
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log("pan responder end", gestureState);
            if (recognizeDrag(gestureState)){
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                    {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                    ],
                    { cancelable: false }
                );
            }
            else if (recognizeComment(gestureState)) {
                props.toggleModal()
            }

            return true;
        },
        onPanResponderGrant: () => {this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'))}
    })

    if ( dish != null ) {
        return (
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000} 
                ref={this.handleViewRef} 
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle = {dish.name}
                    image = {{uri: baseUrl + dish.image}}
                >
                    <Text
                        style = {{margin: 10}}
                    >
                        {dish.description}
                    </Text>
                    <View style={{flex: 1, flexDirection: "row", justifyContent: 'center'}}>
                        <Icon raised reverse name={props.favorite ? 'heart' : 'heart-o'} type="font-awesome" color="#f50" onPress={() => props.favorite ? console.log('Already favorite') : props.markFavorite() }>
                        </Icon>
                        <Icon raised reverse name={'pencil'} type="font-awesome" color="#512DA8" onPress = {() => props.toggleModal() }>
                        </Icon>
                        <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} 
                        /> 
                    </View>                                              
                </Card>
            </Animatable.View>
        )
    }
    else {
        return (
            <View></View>
        )
    }
}

function RenderComments (props) {
    const comments = props.comments
    const renderCommentItem = ({item,index}) => (
        <View key={index} style={{margin:10}}>
            <Text style={{fontSize: 14}}>
                {item.comment}
            </Text>
            <Text>
                <Rating imageSize={12} readonly startingValue={item.rating} />
            </Text>
            <Text style={{fontSize: 12}}>
                {'-- ' + item.author + ', ' + item.date}
            </Text>
        </View>
    )

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title="Comments">
                <FlatList
                    data = {comments}
                    renderItem = {renderCommentItem}
                    keyExtractor = { item => item.id.toString()}
                >
                </FlatList>
            </Card>
        </Animatable.View>
    )
}

class Dishdetail extends Component  {

    constructor(props){
        super(props)
        this.state = {
            showModal: false
        }
    }

    static navigationOptions = {
        title: 'Dish Details'
    }

    toggleModal() {
        this.setState(
            (state) => ({showModal: !state.showModal})
        );
    }

    markFavorite (dishId) {
        this.props.postFavorite(dishId);
    }

    handleComment (dishId, rating, comment, author){
        var date = new Date().toISOString();
        id       = this.props.comments.comments.length;
        comment = {
            id: id,
            dishId: dishId,
            rating: rating,
            comment: comment,
            author: author,
            date: date
        } 
        this.props.postComment(comment)
    }


    render () {
        const dishId = this.props.navigation.getParam('dishId','')
        let author = null
        let comment = null
        let rating = null
        return (
            <ScrollView>
                <RenderDish 
                    dish = {this.props.dishes.dishes[+dishId]} 
                    favorite = {this.props.favorites.some(el => el === dishId)}
                    markFavorite = {() => this.markFavorite(dishId)}
                    toggleModal  = {() => this.toggleModal()}
                />
                <RenderComments comments = {this.props.comments.comments.filter((comment) => comment.dishId === dishId)}/>
                <Modal animationType = {"slide"} transparent = {false}
                    visible = {this.state.showModal}
                    onDismiss = {() => this.toggleModal() }
                    onRequestClose = {() => this.toggleModal() }>
                    <View style = {styles.modal}>
                        <Rating
                            imageSize = {24}
                            showRating
                            onFinishRating={(rt) => rating = rt}
                            style={{ paddingVertical: 10 }}
                        />
                        <Input
                            placeholder='  Author'
                            leftIcon={{ type: 'font-awesome', name: 'user' }}
                            onChangeText={value => author = value}
                        />
                        <Input
                            placeholder='  Comment'
                            leftIcon={{ type: 'font-awesome', name: 'comment' }}
                            onChangeText={value => comment = value}
                        />
                        <View style = {styles.modalText}>
                            <Button 
                                onPress = {() => { this.handleComment(dishId, rating, comment, author);this.toggleModal(); }}
                                color="#512DA8"
                                title="Submit"                                
                            />
                        </View>
                        <View style = {styles.modalText}>
                            <Button 
                                onPress = { () => this.toggleModal()} 
                                color="gray"
                                title="Cancel" 
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>            
        )
    } 
    
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        margin: 20
     },
     modalText: {
         fontSize: 18,
         margin: 10
     }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail)
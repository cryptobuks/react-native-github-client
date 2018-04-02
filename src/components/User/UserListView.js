import React, { PureComponent } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import {
  ListItem,
  List,
  Text,
  Left,
  Body,
  Right,
  Thumbnail,
  Row,
  Input,
  Item,
  Icon,
} from 'native-base';
import type { Node } from 'react';
import SwipeRow from 'SwipeRow';
import { followUser, unfollowUser } from './mutations';
import { openWebView } from 'utils';
import _ from 'lodash';

type Props = {
  data: {
    loading: Boolean,
  },
  users: [Object],
  fetchMore: Node => null,
  refetch: Node => null,
  navigator: Object,
  userType: ?String,
  searchEnabled: ?Boolean,
};

/**
 * Display a List of Users
 * @extends PureComponent
 */
class UserListView extends PureComponent<Props> {
  static defaultProps = {
    search: false,
  };

  state = {
    refreshing: false,
    query: '',
    filtered: [],
  };

  /**
   * Open the User page to display information related to the specific user when
   * it is being pressed
   * @param  {Object} node  user object
   */
  handleClickUser = (node: Object) => () => {
    if (node.__typename === 'Organization')
      openWebView(node.url, this.props.navigator)();
    else
      this.props.navigator.push({
        screen: 'profile.user',
        title: node.login,
        passProps: { login: node.login },
      });
  };

  /**
   * Used in FlatList to make sure that each user has a distinct key
   * @param  {Object} user  object containing information for each user
   * @return {String}      a unique key used to identify each row in list
   */
  userKeyExtractor = user => user.node.id;

  /**
   * Renders the user object into a row in the list
   * @param  {Object} item the object containing information for each user
   * @return {Node}       a React Native Node that can be rendered into a row
   *                      in the list
   */
  renderUser = ({ item: { node } }) => (
    <SwipeRow
      icon={
        node.viewerIsFollowing
          ? {
              name: 'person-outline',
              text: 'Unfollow',
              color: 'firebrick',
            }
          : { name: 'person-add', text: 'Follow', color: 'steelblue' }
      }
      onPressButton={(node.viewerIsFollowing ? unfollowUser : followUser)(
        node.login
      )}
    >
      <ListItem avatar onPress={this.handleClickUser(node)}>
        <Left>
          <Thumbnail source={{ uri: node.avatarUrl }} style={styles.avatar} />
        </Left>
        <Body>
          <Row>
            {!!node.name && <Text style={styles.nameText}>{node.name}</Text>}
            <Text style={styles.usernameText}>{node.login}</Text>
          </Row>
          <Text note numberOfLines={2} style={styles.bioText}>
            {node.bio}
          </Text>
        </Body>
        <Right />
      </ListItem>
    </SwipeRow>
  );

  handleChangeQuery = query =>
    this.setState({
      query,
      filtered: query
        ? _.filter(this.props.users, this.repoFilter(query))
        : undefined,
    });

  repoFilter = query => ({ node }) =>
    _.includes(_.lowerCase(node.login), _.lowerCase(query)) ||
    (node.name && _.includes(_.lowerCase(node.name), _.lowerCase(query)));

  renderSearchBar = () => (
    <Item>
      <Icon active name="search" style={styles.icon} />
      <Input
        placeholder="Begin Searching..."
        onChangeText={this.handleChangeQuery}
        value={this.state.query}
        placeholderTextColor="darkgrey"
      />
    </Item>
  );

  render = () => (
    <List style={styles.listContainer}>
      <FlatList
        data={
          this.props.searchEnabled && this.state.query
            ? this.state.filtered
            : this.props.users
        }
        renderItem={this.renderUser}
        ListHeaderComponent={this.props.searchEnabled && this.renderSearchBar}
        ListEmptyComponent={<Text>No Content</Text>}
        keyExtractor={this.userKeyExtractor}
        onEndReached={this.props.fetchMore(this)}
        onRefresh={this.props.refetch(this)}
        refreshing={this.state.refreshing}
      />
    </List>
  );
}

const styles = StyleSheet.create({
  bioText: {
    marginTop: 3,
  },
  avatar: {
    margin: 5,
  },
  nameText: {
    marginRight: 10,
  },
  usernameText: {
    color: 'gray',
  },
  listContainer: {
    flex: 1,
  },
  icon: {
    marginLeft: 10,
  },
});

export default UserListView;

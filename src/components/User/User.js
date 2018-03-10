import React, { PureComponent } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
  Container,
  Content,
  Text,
  List,
  ListItem,
  Body,
  Thumbnail,
  Title,
  Col,
  Row,
  Grid,
} from 'native-base';
import _ from 'lodash/fp';
import { graphql } from 'react-apollo';
import moment from 'moment';
// types
import type { Node } from 'react';

import { openURL } from 'Profile/src/utils';
import { getUserQuery } from './queries';
import ListRow from './ListRow';

// map graphql query item with iconname & labelname
const profileMap = {
  login: ['octoface', 'Username'],
  email: ['mail', 'Email', null, email => openURL('mailto:' + email)],
  company: ['organization', 'Company'],
  location: ['location', 'Location'],
  websiteUrl: [
    'link',
    'Website',
    url => url.replace(/^http(s?):\/\/|\/$/gi, ''),
    openURL,
  ],
  createdAt: ['calendar', 'Joined', date => moment(date).format('LL')],
};

type Props = {
  data: {
    loading: Boolean,
    viewer: Object,
  },
  navigator: Object,
};

@graphql(getUserQuery())
class Profile extends PureComponent<Props> {
  renderProfileList = viewer =>
    _.flow(
      _.entries,
      _.map(
        ([queryItem, [iconName, labelName, callback, onPressFunc]]) =>
          viewer[queryItem] ? (
            <ListRow
              key={queryItem}
              text={callback ? callback(viewer[queryItem]) : viewer[queryItem]}
              iconName={iconName}
              labelName={labelName}
              onPress={onPressFunc ? onPressFunc(viewer[queryItem]) : null}
            />
          ) : null
      )
    )(profileMap);

  handlePressFollower = () =>
    this.props.navigator.push({
      screen: 'profile.user.list',
      title: 'Followers',
      passProps: { userType: 'followers' },
    });

  handlePressFollowing = () =>
    this.props.navigator.push({
      screen: 'profile.user.list',
      title: 'Following',
      passProps: { userType: 'following' },
    });

  handlePressStarRepo = () =>
    this.props.navigator.push({
      screen: 'profile.repository.list',
      title: 'Starred Repositories',
      passProps: { repoType: 'starredRepositories' },
    });

  handlePressOwnRepo = () =>
    this.props.navigator.push({
      screen: 'profile.repository.list',
      title: 'Owned Repositories',
      passProps: { repoType: 'repositories' },
    });

  render = (): Node => {
    const { data: { loading, viewer, error } } = this.props;
    return loading ? (
      <Text>Loading</Text>
    ) : error ? (
      <Text>Connection error</Text>
    ) : (
      <Container>
        <Content>
          <List>
            <ListItem noBorder>
              <Body style={styles.centerContainer}>
                <Thumbnail
                  large
                  source={{ uri: viewer.avatarUrl }}
                  style={styles.avatar}
                />
                <Title>{viewer.name}</Title>
                <Text style={styles.bio}>{viewer.bio}</Text>
              </Body>
            </ListItem>
            <ListItem>
              <Body style={{ flex: 3 }}>
                <Grid>
                  <Col>
                    <TouchableOpacity
                      style={styles.centerContainer}
                      onPress={this.handlePressFollower}
                    >
                      <Row>
                        <Text>Followers</Text>
                      </Row>
                      <Row>
                        <Text note>{viewer.followers.totalCount}</Text>
                      </Row>
                    </TouchableOpacity>
                  </Col>
                  <Col>
                    <TouchableOpacity
                      style={styles.centerContainer}
                      onPress={this.handlePressFollowing}
                    >
                      <Row>
                        <Text>Following</Text>
                      </Row>
                      <Row>
                        <Text note>{viewer.following.totalCount}</Text>
                      </Row>
                    </TouchableOpacity>
                  </Col>
                </Grid>
              </Body>
            </ListItem>
            <ListItem itemDivider bordered />

            {this.renderProfileList(viewer)}
            <ListItem itemDivider bordered />
            <ListRow
              iconName="star"
              labelName="Starred Repositories"
              text={viewer.starredRepositories.totalCount}
              onPress={this.handlePressStarRepo}
            />
            <ListRow
              iconName="repo"
              labelName="Owned Repositories"
              text={viewer.repositories.totalCount}
              onPress={this.handlePressOwnRepo}
            />
          </List>
        </Content>
      </Container>
    );
  };
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 10,
  },
  bio: {
    color: 'darkgray',
  },
});

export default Profile;
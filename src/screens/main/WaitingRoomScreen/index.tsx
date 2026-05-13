import React from 'react';
import {View, Text, FlatList} from 'react-native';
import {Button, Header} from '../../../components';
import {styles} from './styles';

const users = [
  {id: '1', name: 'Alex', status: 'Ready'},
  {id: '2', name: 'Jamie', status: 'Not ready'},
];

type Props = {
  onOpenDrawer?: () => void;
};

const WaitingRoomScreen = ({onOpenDrawer}: Props) => (
  <View style={styles.container}>
    <Header
      title="Waiting Room"
      subtitle="Waiting for the session to start."
      onMenuPress={onOpenDrawer}
    />
    <FlatList
      data={users}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <View style={styles.userRow}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userStatus}>{item.status}</Text>
        </View>
      )}
      contentContainerStyle={styles.list}
    />
    <Button title="Start session" onPress={() => null} />
  </View>
);

export default WaitingRoomScreen;

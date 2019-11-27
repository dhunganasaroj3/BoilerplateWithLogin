import React from 'react'
import {Sidebar, Segment, Header, Image, Menu, Icon, Button, SidebarPushable} from 'semantic-ui-react';


class TopNavigation extends React.Component {
    state = {
        visisble:true
    }

    render() {
        const {visisble} = this.state;
        return (
            <div>
                <Sidebar.Pushable as={Segment}>
                <Sidebar as={Menu} animation='overlay' direction="top" visible={visisble} inverted>
                <Menu.Item name='home'>
                <Icon name='home' />
                Home
              </Menu.Item>
              <Menu.Item name='gamepad'>
                <Icon name='gamepad' />
                Games
              </Menu.Item>
              <Menu.Item name='camera'>
                <Icon name='camera' />
                Channels
              </Menu.Item>
                </Sidebar>
                </Sidebar.Pushable>
            </div>
        )
    }
}

export default TopNavigation;
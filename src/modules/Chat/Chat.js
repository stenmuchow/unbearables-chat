//@flow
import React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { decorateOutput, sanitizeInput } from 'src/utils/util';
import ChatInputForm from './ChatInputForm';
import userActions from 'src/store/user/user.action';
import { type UserObjectType } from 'src/types';
import Members from 'src/components/Members/Members';
import CircularProgress from '@material-ui/core/CircularProgress';
import { scroller } from 'react-scroll';

import {
  LogoutMenu,
  ChatContainer,
  ChatLine,
  OuterWrapper,
  Container,
  Header,
  Wrapper,
  LoaderContainer,
} from './ChatComponents';
import distanceInWords from 'date-fns/distance_in_words';

const clean = input => input && decorateOutput(sanitizeInput(input));

type Props = {
  logout: Function,
  sendMessage: Function,
  user: UserObjectType,
  chat: [],
};

class Home extends React.PureComponent<Props> {
  logout = () => {
    this.props.logout();
  };

  messagesEnd = React.createRef();

  scrollToBottom = () => {
    scroller.scrollTo('messagesEnd', {
      duration: 500,
      smooth: true,
      containerId: 'ChatContainer',
    });
  };

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    const { user, chat } = this.props;
    return (
      <OuterWrapper>
        <Helmet>
          <title>Unbearables...</title>
          <meta name="Chat" content="Chat" />
        </Helmet>
        <Container>
          <Members />
          <Wrapper>
            <Header>
              <span />
              <LogoutMenu logout={this.logout} />
            </Header>
            <ChatContainer id="ChatContainer">
              {chat.length ? (
                chat.map((data, key) => (
                  <ChatLine key={key} ownUser={data.value.from === user.uid}>
                    {data.value.from !== user.uid && (
                      <div className="name">{data.value.name}</div>
                    )}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: clean(data.value.content, user.displayName),
                      }}
                    />
                    <div className="timestamp">
                      {distanceInWords(Date.now(), data.value.at) + ' ago'}
                    </div>
                  </ChatLine>
                ))
              ) : (
                <LoaderContainer>
                  <CircularProgress />
                </LoaderContainer>
              )}
              <div className="messagesEnd" name="messagesEnd" />
            </ChatContainer>
            <ChatInputForm />
          </Wrapper>
        </Container>
      </OuterWrapper>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      logout: () => userActions.userLogout(),
    },
    dispatch
  );

const mapStateToProps = state => ({
  user: state && state.user && state.user.user,
  chat: state && state.chat && state.chat.content,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);

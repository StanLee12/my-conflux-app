
import React, { useState } from 'react';
import { Layout, Input, Button, message, Space, Typography, Card } from 'antd';
import { Conflux, Drip } from 'js-conflux-sdk';
import ABI from '../abi/LongNFT.json';
import env from '../config/env';
const { Header, Content } = Layout;


/**
 *  networkId
 * '1029': Conflux Main Network
 *  '1': Conflux Test network
 */
const conflux = new Conflux({
  url: env.CONFLUX_NODE_RPC,
  networkId: 1,
  logger: console,
});
console.log('conflux version', conflux.version);

const contract = conflux.Contract({
  abi: ABI.abi,
  address: env.CONTRACT_ADDRESS,
});

if (!env.PRIVATE_KEY) {
    message.error('请设置Private Key');
}

const account = conflux.wallet.addPrivateKey(env.PRIVATE_KEY);

const provider = window.conflux;

function Home() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('');
  const [contractName, setContractName] = useState('');
  const [fcBalance, setFcBalance] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [estimateInfo, setEstimateInfo] = useState('');
  const [transactionHash, setTransactionHash] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [tokenIds, setTokenIds] = useState(0);
  const [selfAddress, setSelfAddress] = useState();
  const [tokenUri, setTokenUri] = useState('');

  const getBalance = async () => {
      if (!address) {
          message.error('请输入正确地址');
          return;
      }
      try {
          setLoading(true);
          const balance = await conflux.cfx.getBalance(address);
          setBalance(new Drip(balance).toCFX());
      } catch (error) {
          message.error(error.message);
      } finally {
          setLoading(false);
      }
  };

  const getContract = async () => {
      try {
        const name = await contract.name();
        setContractName(name);
      } catch (error) {
        message.error(error.message);
      };
  };

  const getFcBalance = async () => {
    try {
      if (!selfAddress) {
        message.error('请先连接钱包');
        return;
      }
      const fcBalance = await contract.tokenOfOwnerByIndex(selfAddress, 0);
      setFcBalance(fcBalance);
    } catch (error) {
      message.error(error.message);
    };
  };

  const estimate = async () => {
      if (!address && !imageUri) {
          message.error('请完善信息');
          return;
      }
      try {
        const estimated = await contract.publish(address, imageUri).estimateGasAndCollateral({ from: account });
        setEstimateInfo(JSON.stringify(estimated));
      } catch (error) {
        message.error(error.message);
      }
  };

  const publish = async() => {
    if (!address && !imageUri) {
        message.error('请完善信息');
        return;
    }
    try {
      const transactionHash = await contract.publish(address, imageUri).sendTransaction({ from: account });
      setTransactionHash(transactionHash);
      message.success('发布NFT成功');
    } catch (error) {
      message.error(error.message);
    }
  };

  const queryTokenUri = async() => {
    if (!tokenId) {
        message.error('请输入要查询的图片TokenId');
        return;
    }
    try {
      const tokenUri = await contract.tokenURI(tokenId);
      setTokenUri(tokenUri);
    } catch (error) {
      message.error(error.message);
    }
  };

  const countTokenIds = async() => {
    try{
      const result = await contract.countTokenIds();
      console.log('cahuxnjieguo', result);
      setTokenIds(result);
    } catch (error) {
      message.error(error.message);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.conflux) {
        message.error('请先安装Fluent钱包');
        return;
      }
      const { result } = await provider.send('cfx_requestAccounts');
      setSelfAddress(result[0]);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <>
      <Layout>
        <Header style={{ backgroundColor: '#a0d911', color: 'white', fontSize: 20 }}>
          Conflux
          <Button disabled={selfAddress} type="primary" shape="round" style={{marginLeft: 200}} onClick={connectWallet}>
            {selfAddress ? '已连接' : '连接钱包'}
          </Button>
          <Typography.Text
            style={{ fontSize: 12, color: 'white' }}
          >
            {selfAddress ? `钱包: ${JSON.stringify(selfAddress)}` : ''}
          </Typography.Text>
        </Header>
        <Content style={{ padding: 5, alignItems: 'center', justifyContent: 'center' }}>
          <Space align='start' size='middle' direction='vertical'>
            <Space align='start' size='middle'>
            <Card
              title='账号余额查询'
            >
              <Space direction='vertical' align='center' size='middle'>
                <Input
                    size='large'
                    style={{width: 500}}
                    allowClear
                    onChange={(event) => {
                        setAddress(event.target.value);
                    }}
                    onPressEnter={getBalance}
                />
                <Button
                    type='primary'
                    loading={loading}
                    onClick={getBalance}
                >查询余额</Button>
                <Typography.Text
                    strong
                >{`余额为: ${balance}`}</Typography.Text>
            </Space>
            </Card>
            <Card
              title='合约信息查询'
            >
              <Space style={{ alignItems: 'center', justifyContent: 'center' }} direction='vertical' align='center' size='middle'>
                <Typography.Text
                    strong
                >{`合约信息: ${contractName}`}</Typography.Text>
                <Button
                  type='primary'
                  onClick={getContract}
                >
                  查询合约
                </Button>
            </Space>
            </Card>
            <Card
              title='NFT余额查询'
            >
              <Space style={{ alignItems: 'center', justifyContent: 'center' }} direction='vertical' align='center' size='middle'>
                <Typography.Text
                    strong
                >{`NFT余额: ${fcBalance}`}</Typography.Text>
                <Button
                  type='primary'
                  onClick={getFcBalance}
                >
                  查询NFT余额
                </Button>
            </Space>
            </Card>
            </Space>
            <Space align='start' size='middle'>
            <Card
              title='发布NFT'
            >
              <Space style={{ alignItems: 'center', justifyContent: 'center' }} direction='vertical' align='center' size='middle'>
                <Typography.Text
                    strong
                >{`费用信息: ${estimateInfo}`}</Typography.Text>
                <Typography.Text
                    strong
                >{`Transaction Hash: ${transactionHash}`}</Typography.Text>
                <Input
                    placeholder='钱包地址'
                    size='large'
                    style={{width: 500}}
                    allowClear
                    onChange={(event) => {
                        setAddress(event.target.value);
                    }}
                />
                <Input
                    placeholder='图片地址'
                    size='large'
                    style={{width: 500}}
                    allowClear
                    onChange={(event) => {
                        setImageUri(event.target.value);
                    }}
                />
                  <Space>
                    <Button
                      type='primary'
                      onClick={estimate}
                    >
                      预估费用
                    </Button> 
                    <Button
                      type='primary'
                      onClick={publish}
                    >
                      发布NFT
                    </Button>
                  </Space>
                </Space>
            </Card>
            <Card title='NFT URI查询'>
              <Space direction='vertical' align='center' size='middle' style={{ width: 300 }}>
                  <Typography.Paragraph
                      style={{ width: 250 }}
                      strong
                      copyable
                      ellipsis={{ rows: 5, expandable: true, symbol: 'more' }}
                  >{`图片地址: ${tokenUri}`}</Typography.Paragraph>
                  <Input
                    placeholder='Token Id'
                    size='large'
                    style={{width: 200}}
                    allowClear
                    onChange={(event) => {
                        setTokenId(event.target.value);
                    }}
                  />
                  <Button
                    type='primary'
                    onClick={queryTokenUri}
                  >
                    查寻NFT地址
                  </Button>
              </Space>
            </Card>
            <Card title='NFT总数查询'>
              <Space direction='vertical' align='center' size='middle'>
                  <Typography.Text
                      strong
                  >{`NFT数量: ${tokenIds}`}</Typography.Text>
                  <Button
                    type='primary'
                    onClick={countTokenIds}
                  >
                    查寻NFT总数
                  </Button>
              </Space>
            </Card>
            </Space>
          </Space>
        </Content>
      </Layout>
    </>
  );
}

export default Home;
